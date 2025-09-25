import { useRef, useCallback } from 'react'

interface NotificationSoundOptions {
  volume?: number
  enabled?: boolean
}

export function useNotificationSound(options: NotificationSoundOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { volume = 0.7, enabled = true } = options

  const playSound = useCallback(async (soundType: 'message' | 'notification' | 'alert' = 'message') => {
    if (!enabled) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Diferentes sonidos según el tipo
      switch (soundType) {
        case 'message':
          // Sonido suave para mensajes (campana)
          createBellSound(audioContext, volume)
          break
        case 'notification':
          // Sonido de notificación (ping)
          createPingSound(audioContext, volume)
          break
        case 'alert':
          // Sonido de alerta (tono más llamativo)
          createAlertSound(audioContext, volume)
          break
        default:
          createPingSound(audioContext, volume)
      }
      
      console.log('🔊 Sonido de notificación reproducido:', soundType)
    } catch (error) {
      console.warn('⚠️ No se pudo reproducir el sonido:', error)
    }
  }, [enabled, volume])

  // Función para crear sonido de campana
  const createBellSound = (audioContext: AudioContext, vol: number) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Frecuencia de campana (acorde)
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
    
    oscillator.type = 'sine'
    
    // Envelope suave
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(vol * 0.2, audioContext.currentTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 1.5)
  }

  // Función para crear sonido de ping
  const createPingSound = (audioContext: AudioContext, vol: number) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1)
    oscillator.type = 'triangle'
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(vol * 0.3, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }

  // Función para crear sonido de alerta
  const createAlertSound = (audioContext: AudioContext, vol: number) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Sonido de alerta más llamativo
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.3)
    oscillator.type = 'square'
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(vol * 0.4, audioContext.currentTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.05)
    gainNode.gain.linearRampToValueAtTime(vol * 0.4, audioContext.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15)
    gainNode.gain.linearRampToValueAtTime(vol * 0.4, audioContext.currentTime + 0.2)
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.25)
    gainNode.gain.linearRampToValueAtTime(vol * 0.4, audioContext.currentTime + 0.3)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  }

  return { playSound }
}
