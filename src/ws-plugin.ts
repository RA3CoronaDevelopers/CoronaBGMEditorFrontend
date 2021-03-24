import { App, inject, onBeforeUnmount, Ref, ref } from "vue"
import WebSocketAsPromised from "websocket-as-promised"

class Connection {
  public readonly ws: WebSocketAsPromised

  constructor(url: string) {
    this.ws = new WebSocketAsPromised(url, {
      packMessage: (data) => JSON.stringify(data),
      unpackMessage: async (data) => {
        console.log(data);
        if (data instanceof ArrayBuffer) {
          const decoder = new TextDecoder()
          data = decoder.decode(data)
        }
        if (data instanceof Blob) {
          data = await data.text()
        }
        return JSON.parse(data)
      },
      attachRequestId: (data, requestId) => ({ id: requestId, ...data }),
      extractRequestId: (data) => data && data.id,
    })
  }

  send(message: InputMessage) { return this.ws.sendPacked(message) }
  sendRequest(message: InputMessage) { return this.ws.sendRequest(message) }

  addMessageHandler<TKey extends string, TValue extends string>(
    key: TKey,
    value: TValue,

    handler: (message: Extract<OutputMessage, Record<TKey, TValue>>)
      // eslint-disable-next-line
      => any
  ) {
    this.ws.onUnpackedMessage.addListener(message => {
      if (message[key] === value) {
        handler(message)
      }
    })
  }

  // eslint-disable-next-line
  removeMessageHandler(handler: (...args: any[]) => any) {
    this.ws.onUnpackedMessage.removeListener(handler)
  }

  useMessageHandler<TKey extends keyof OutputMessage, TValue extends OutputMessage[TKey]>(
    key: TKey,
    value: TValue,
    handler: (message: Extract<OutputMessage, Record<TKey, TValue>>)
      // eslint-disable-next-line
      => any
  ) {
    this.addMessageHandler(key, value, handler)
    onBeforeUnmount(() => this.removeMessageHandler(handler))
  }
}

const connectionSymbol = Symbol('WS Connection')
const connectedSymbol = Symbol('WS Connection status')


export const wsPlugin = {
  install: (app: App, url: string) => {
    const connected = ref(false)
    app.config.globalProperties.$wsConnected = connected
    const connection = new Connection(url)

    const connect = async () => {
      try {
        await connection.ws.open()
        connected.value = true
      }
      catch {
        await new Promise(resolve => setTimeout(resolve, 1000))
        await connect()
      }
    }
    connect()
    
    app.provide(connectionSymbol, connection)
    app.provide(connectedSymbol, connected)
  }
}

export const useConnection = () => inject(connectionSymbol) as Connection
export const useConnected = () => inject(connectedSymbol) as Ref<boolean>