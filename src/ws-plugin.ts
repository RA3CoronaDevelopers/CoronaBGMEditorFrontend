import { App, onBeforeUnmount, onMounted, Ref, ref } from "vue"
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

  useMessageHandler<TKey extends string, TValue extends string>(
    key: TKey,
    value: TValue,
    handler: (message: Extract<OutputMessage, Record<TKey, TValue>>)
      // eslint-disable-next-line
      => any
  ) {
    onMounted(() => this.addMessageHandler(key, value, handler))
    onBeforeUnmount(() => this.removeMessageHandler(handler))
  }
}

export default {
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
    
    app.provide('$connection', connection)
    app.provide('$connected', connected)
  }
}

/*
declare module '@vue/runtime-core' {
  //Bind to `this` keyword
  interface ComponentCustomProperties {
    $wsConnected: Ref<boolean>;
    $ws: WebSocketAsPromised;
  }
}
*/

declare module 'vue' {
  export function inject(key: '$connection'): Connection
  export function inject(key: '$connected'): Ref<boolean>
}