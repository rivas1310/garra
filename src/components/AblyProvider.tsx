'use client'

import { AblyProvider, ChannelProvider } from 'ably/react'
import ably from '@/lib/ably'

export default function CustomAblyProvider({ children }: { children: React.ReactNode }) {
  return (
    <AblyProvider client={ably}>
      <ChannelProvider channelName="chat-widget">
        {children}
      </ChannelProvider>
    </AblyProvider>
  )
}
