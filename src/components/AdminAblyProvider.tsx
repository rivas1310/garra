'use client'

import { AblyProvider, ChannelProvider } from 'ably/react'
import ably from '@/lib/ably'

export default function AdminAblyProvider({ children }: { children: React.ReactNode }) {
  return (
    <AblyProvider client={ably}>
      <ChannelProvider channelName="chat-admin">
        {children}
      </ChannelProvider>
    </AblyProvider>
  )
}
