import CredentialsProvider from 'next-auth/providers/credentials'
import { log } from '@/lib/secureLogger'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'
import type { NextAuthOptions, DefaultSession } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

// Extender los tipos de NextAuth para 2FA
declare module 'next-auth' {
  interface User {
    role?: 'USER' | 'ADMIN' | 'ADMIN' | 'VENDOR'
    requires2FA?: boolean
    tempUserData?: {
      id: string
      email: string
      name: string | null
      role: string
    }
  }
  interface Session {
    user: {
      id?: string
      role?: 'USER' | 'ADMIN' | 'VENDOR'
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'USER' | 'ADMIN' | 'VENDOR'
    requires2FA?: boolean
    tempUserData?: {
      id: string
      email: string
      name: string | null
      role: string
    }
  }
}

// Función para generar código de 8 dígitos
function generate2FACode(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString()
}

// Función para enviar código 2FA (importada del email.ts)
async function send2FACode(email: string, code: string, userName?: string): Promise<boolean> {
  try {
    const { send2FACode: sendCode } = await import('@/lib/email')
    return await sendCode(email, code, userName)
  } catch (error) {
    log.error('Error importing send2FACode:', error)
    return false
  }
}

export const authOptions2FA: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials-2fa',
      name: 'Email y Contraseña con 2FA',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'tucorreo@ejemplo.com' },
        password: { label: 'Contraseña', type: 'password' },
        twoFactorCode: { label: 'Código 2FA', type: 'text', placeholder: '12345678' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Si hay código 2FA, verificar el código
        if (credentials.twoFactorCode) {
          return await verify2FACode(credentials.email, credentials.twoFactorCode)
        }

        // Si no hay código 2FA, iniciar proceso de 2FA
        return await initiate2FA(credentials.email, credentials.password)
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    newUser: '/perfil',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.requires2FA) {
          token.requires2FA = true
          token.tempUserData = user.tempUserData
        } else {
          token.role = user.role
          token.requires2FA = false
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && !token.requires2FA) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Si requiere 2FA, redirigir a la página de verificación
      if (url.includes('requires2FA=true')) {
        return `${baseUrl}/verify-2fa`
      }
      
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      } else if (new URL(url).origin === baseUrl) {
        return url
      }
      return `${baseUrl}/perfil`
    }
  }
}

// Función para iniciar el proceso de 2FA
async function initiate2FA(email: string, password: string) {
  try {
    // Buscar usuario
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() } 
    })
    
    if (!user || !user.hashedPassword) {
      return null
    }
    
    // Verificar contraseña
    const isValid = await compare(password, user.hashedPassword)
    if (!isValid) {
      return null
    }

    // Verificar rate limiting
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    const recentCodes = await prisma.twoFactorCode.count({
      where: {
        email: user.email,
        createdAt: {
          gte: fifteenMinutesAgo
        }
      }
    })

    if (recentCodes >= 3) {
      throw new Error('Rate limit exceeded')
    }

    // Generar código 2FA
    const code = generate2FACode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    // Limpiar códigos anteriores
    await prisma.twoFactorCode.deleteMany({
      where: { userId: user.id }
    })

    // Guardar nuevo código
    await prisma.twoFactorCode.create({
      data: {
        userId: user.id,
        email: user.email,
        code,
        expiresAt,
      }
    })

    // Enviar código por email
    const emailSent = await send2FACode(user.email, code, user.name || undefined)
    
    if (!emailSent) {
      // Si falla el email, eliminar el código
      await prisma.twoFactorCode.deleteMany({
        where: { userId: user.id, code }
      })
      throw new Error('Failed to send email')
    }

    // Retornar usuario con flag de 2FA requerido
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      requires2FA: true,
      tempUserData: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }
  } catch (error) {
    log.error('Error in initiate2FA:', error)
    return null
  }
}

// Función para verificar código 2FA
async function verify2FACode(email: string, code: string) {
  try {
    // Validar formato del código
    if (!/^\d{8}$/.test(code)) {
      return null
    }

    // Buscar código válido
    const twoFactorCode = await prisma.twoFactorCode.findFirst({
      where: {
        email: email.toLowerCase(),
        code,
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    })

    if (!twoFactorCode) {
      return null
    }

    // Verificar intentos
    if (twoFactorCode.attempts >= 3) {
      return null
    }

    // Marcar código como usado
    await prisma.twoFactorCode.update({
      where: { id: twoFactorCode.id },
      data: { isUsed: true }
    })

    // Limpiar códigos antiguos
    await prisma.twoFactorCode.deleteMany({
      where: { userId: twoFactorCode.userId, isUsed: true }
    })

    // Retornar usuario autenticado
    return {
      id: twoFactorCode.user.id,
      email: twoFactorCode.user.email,
      name: twoFactorCode.user.name,
      role: twoFactorCode.user.role,
      requires2FA: false
    }
  } catch (error) {
    log.error('Error in verify2FACode:', error)
    return null
  }
}
