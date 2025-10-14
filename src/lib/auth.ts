import CredentialsProvider from 'next-auth/providers/credentials'
import { log } from '@/lib/secureLogger'
import GoogleProvider from 'next-auth/providers/google'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'
import type { NextAuthOptions, DefaultSession } from 'next-auth'
import type { JWT } from 'next-auth/jwt'

// Extender los tipos de NextAuth
declare module 'next-auth' {
  interface User {
    role?: 'USER' | 'ADMIN' | 'VENDEDOR' | 'VENDOR'
  }
  interface Session {
    user: {
      id?: string
      role?: 'USER' | 'ADMIN' | 'VENDEDOR' | 'VENDOR'
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: 'USER' | 'ADMIN' | 'VENDEDOR' | 'VENDOR'
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email y Contraseña',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'tucorreo@ejemplo.com' },
        password: { label: 'Contraseña', type: 'password' },
        twoFactorCode: { label: 'Código 2FA', type: 'text', placeholder: '12345678' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        // Si el password es '2FA_VERIFIED' y hay código 2FA, verificar el código directamente
        if (credentials.password === '2FA_VERIFIED' && credentials.twoFactorCode) {
          return await verify2FACodeDirect(credentials.email, credentials.twoFactorCode)
        }
        
        const user = await prisma.user.findUnique({ 
          where: { email: credentials.email } 
        })
        
        if (!user || !user.hashedPassword) return null
        
        const isValid = await compare(credentials.password, user.hashedPassword)
        if (!isValid) return null
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
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
    newUser: '/perfil', // Cambiado de '/registro' a '/perfil'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Cuando el usuario inicia sesión por primera vez
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Solo se ejecuta para proveedores OAuth como Google
      if (account?.provider === 'google' && profile?.email) {
        try {
          // Verificar si el usuario ya existe
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email }
          })
          
          // Si no existe, crear un nuevo usuario
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.name || 'Usuario de Google',
                role: 'USER',
                // No establecemos hashedPassword para usuarios de OAuth
              }
            })
          }
          
          return true
        } catch (error) {
          log.error('Error en signIn callback:', error)
          return false
        }
      }
      
      return true
    },
    async redirect({ url, baseUrl }) {
      // Redirección personalizada después del login
      if (url.startsWith('/')) {
        // Si es una ruta relativa, agregar la base URL
        return `${baseUrl}${url}`
      } else if (new URL(url).origin === baseUrl) {
        // Si es la misma URL base, permitir
        return url
      }
      // Por defecto, redirigir al perfil
      return `${baseUrl}/perfil`
    }
  }
}

// Función para verificar código 2FA directamente (usado en el flujo de autenticación)
async function verify2FACodeDirect(email: string, code: string) {
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

    // Marcar código como usado DESPUÉS de verificar que todo está correcto
    await prisma.twoFactorCode.update({
      where: { id: twoFactorCode.id },
      data: { isUsed: true }
    })

    // Limpiar códigos antiguos
    await prisma.twoFactorCode.deleteMany({
      where: { userId: twoFactorCode.userId, isUsed: true }
    })

    // Log de seguridad
    log.info(`✅ Login 2FA exitoso para usuario: ${email}`)

    // Retornar usuario autenticado
    return {
      id: twoFactorCode.user.id,
      email: twoFactorCode.user.email,
      name: twoFactorCode.user.name,
      role: twoFactorCode.user.role
    }
  } catch (error) {
    log.error('Error in verify2FACodeDirect:', error)
    return null
  }
}