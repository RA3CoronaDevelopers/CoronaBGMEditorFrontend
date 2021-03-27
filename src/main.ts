import { createApp } from 'vue'
import App from './App.vue'
import { wsPlugin } from './ws-plugin'
import i18n from './i18n'
import 'normalize.css'
import 'golden-layout/dist/css/goldenlayout-base.css'
import 'golden-layout/dist/css/themes/goldenlayout-dark-theme.css'

const app = createApp(App)
  .use(i18n)
  .use(wsPlugin, 'ws://localhost:19986')
  .mount('#app')

// eslint-disable-next-line
const globalWindow = window as any
globalWindow.app = app