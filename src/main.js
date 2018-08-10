import Vue from 'vue'
import App from './App.vue'
import VueFire from 'vuefire'
import { db, st } from './firebase'

Vue.use(VueFire)

export const currentChatRoom = 'chat-room-1'
export const currentUser = '-LJ8Eq2DI86nwGLn8e62'


Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
