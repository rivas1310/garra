// Declaraciones de tipos para Web Bluetooth API
declare global {
  interface BluetoothDevice {
    id: string
    name?: string
    gatt?: BluetoothRemoteGATTServer
    addEventListener(type: string, listener: EventListener): void
    removeEventListener(type: string, listener: EventListener): void
  }

  interface BluetoothRemoteGATTServer {
    connected: boolean
    connect(): Promise<BluetoothRemoteGATTServer>
    disconnect(): void
    getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>
  }

  interface BluetoothRemoteGATTService {
    getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>
    getCharacteristics(): Promise<BluetoothRemoteGATTCharacteristic[]>
  }

  interface BluetoothRemoteGATTCharacteristic {
    writeValue(value: BufferSource): Promise<void>
    readValue(): Promise<DataView>
    properties: {
      write?: boolean
      writeWithoutResponse?: boolean
      read?: boolean
      notify?: boolean
      indicate?: boolean
    }
  }

  interface Navigator {
    bluetooth?: {
      requestDevice(options: {
        filters: Array<{
          services?: string[]
          namePrefix?: string
        }>
        optionalServices?: string[]
      }): Promise<BluetoothDevice>
    }
  }
}

export {}
