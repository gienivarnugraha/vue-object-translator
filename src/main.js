import { createApp } from 'vue'
import App from './App.vue'

import Notifications from '@kyvg/vue3-notification'

import find from 'array.prototype.find'
import findIndex from 'array.prototype.findindex'


find.shim()
findIndex.shim()

import './assets/main.css'

const app = createApp(App)

app.use(Notifications)

app.mount('#app')
