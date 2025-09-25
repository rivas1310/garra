import { useEffect, useState } from 'react'
import { useChannel } from 'ably/react'

export function useAbly(channelName: string) {
  const [isConnected, setIsConnected] = useState(false)
  
  const { channel } = useChannel(channelName, (message) => {
    console.log('Mensaje recibido en Ably:', message)
  })

  useEffect(() => {
    if (channel) {
      setIsConnected(true)
      return () => {
        setIsConnected(false)
      }
    }
  }, [channel])

  return {
    channel,
    isConnected,
    publish: async (eventName: string, data: any) => {
      if (channel) {
        await channel.publish(eventName, data)
      }
    }
  }
}
