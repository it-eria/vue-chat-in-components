import Vue from 'vue'
import App from './App.vue'
import VueFire from 'vuefire'
import cors from 'cors'


Vue.use(VueFire)
Vue.use(cors)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')