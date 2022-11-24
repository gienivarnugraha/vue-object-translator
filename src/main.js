import { createApp } from 'vue'
import Cloud from './Cloud.vue'
import router from './router'

import find from 'array.prototype.find'
import findIndex from 'array.prototype.findindex'


find.shim()
findIndex.shim()

import './assets/main.css'

const app = createApp(Cloud)

app.use(router)

app.mount('#app')
