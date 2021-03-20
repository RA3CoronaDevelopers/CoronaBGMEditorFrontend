import { createApp } from 'vue'
import App from './App.vue'
import wsPlugin from './ws-plugin'
import i18n from './i18n'

(window as any).app = createApp(App)
  .use(i18n)
  .use(wsPlugin, 'ws://localhost:19986')
  .mount('#app')