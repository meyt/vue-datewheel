import Vue from 'vue'
import App from './App.vue'
import VueDatewheel from '../../src/index'
// import '../../dist/vue-datewheel.css'
Vue.component('vue-datewheel', VueDatewheel)

new Vue({
  render: (h) => h(App)
}).$mount('#app')
