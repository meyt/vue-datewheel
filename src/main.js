import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import VueDatewheel from '../lib/index'

const app = createApp(App)
app.component('vue-datewheel', VueDatewheel)
app.mount('#app')
