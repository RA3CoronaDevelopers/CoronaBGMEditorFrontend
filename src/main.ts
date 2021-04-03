import { createApp } from 'vue'
import App from './App.vue'
import { wsPlugin } from './ws-plugin'
import i18n from './i18n'
import 'normalize.css'
import store from './store'

const app = createApp(App)
  .use(store)
  .use(i18n)
  .use(wsPlugin, 'ws://localhost:19986')
  .mount('#app')

// eslint-disable-next-line
const globalWindow = window as any
globalWindow.app = app