import { createApp } from 'vue'
import App from './App.vue'
import getWsPlugin from './ws-plugin'
import i18n from './i18n'

const wsPlugin = getWsPlugin('ws://localhost:19986', {
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
const app = createApp(App).use(i18n).use(wsPlugin).mount('#app')
