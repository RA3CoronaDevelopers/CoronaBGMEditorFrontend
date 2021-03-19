import { App, Ref, ref } from "vue"
import WebSocketAsPromised from "websocket-as-promised"
import Options from "websocket-as-promised/types/options";

export default (url: string, options: Options) => ({
  install: (app: App) => {
    const connected = ref(false)
    app.config.globalProperties.$wsConnected = connected
    const ws = new WebSocketAsPromised(url, options)
    ws.open().then(() => {
      connected.value = true
    })
    app.config.globalProperties.$ws = ws
  }
})

declare module "@vue/runtime-core" {
  //Bind to `this` keyword
  interface ComponentCustomProperties {
    $wsConnected: Ref<boolean>;
    $ws: WebSocketAsPromised;
  }
}