import Vue from 'vue'
import App from './App.vue'
import firebase from 'firebase/app'
import VueFire from 'vuefire'
import 'firebase/database'

// Initialize Firebase
const config = {
  apiKey: "AIzaSyAC6QK-sCeYF_X8HmM1oCCqhYwWeEFOakg",
  authDomain: "test-chat-c8873.firebaseapp.com",
  databaseURL: "https://test-chat-c8873.firebaseio.com",
  projectId: "test-chat-c8873",
  storageBucket: "test-chat-c8873.appspot.com",
  messagingSenderId: "670720421431"
}

firebase.initializeApp(config)

Vue.use(VueFire)

export const db = firebase.database()

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
