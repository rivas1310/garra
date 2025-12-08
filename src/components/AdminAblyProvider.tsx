'use client'

import { useMemo } from 'react'
import { AblyProvider, ChannelProvider } from 'ably/react'
import { Realtime } from 'ably'

const ablyKey = process.env.NEXT_PUBLIC_ABLY_API_KEY || 'WmvC8Q.fk9jIg:QTbhux1HYhgCpAqW3_3TKiIvcLBNbOEVxybCyT8k0oY'

export default function AdminAblyProvider({ children }: { children: React.ReactNode }) {
  const ablyClient = useMemo(() => {
    if (typeof window === 'undefined') {
      return null
    }
    
    try {
      return new Realtime({
        key: ablyKey,
        clientId: 'admin-client',
        logLevel: 1
      })
    } catch (error) {
      console.error('Error inicializando Ably:', error)
      return null
    }
  }, [])

  if (!ablyClient) {
    return <>{children}</>
  }

  return (
    <AblyProvider client={ablyClient}>
      <ChannelProvider channelName="chat-admin">
        {children}
      </ChannelProvider>
    </AblyProvider>
  )
}
