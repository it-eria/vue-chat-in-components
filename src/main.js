import Vue from 'vue'
import App from './App.vue'
import VueFire from 'vuefire'

Vue.use(VueFire)

export const currentChatRoom = 'chat-room-1'
export const currentUser = '-LJ8EKA6EIRDlHQ4i_a0'

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
