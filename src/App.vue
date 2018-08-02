<template>
  <div id="chat-app">
    <!-- <h1>{{ chatName }}</h1> -->
    <ChatComponent></ChatComponent>
  </div>
</template>

<script>
import ChatComponent from './components/ChatComponent'
import 'firebase/database'
import { db } from './main'

let chat = db.ref('chats').on('value', function(snapshot) {
  return snapshot.val();
});

console.log(chat);

export default {
  name: 'chat-app',
  components: {
    ChatComponent
  },
  data() {
    return {
      userID: 'id-user-1'
    }
  }
}
</script>

<style lang="scss">
  @import './assets/scss/fonts';
  @import './assets/scss/variables';
  @import './assets/scss/general';
  @import './assets/scss/chat-app';
  @import './assets/scss/adaptive';
</style>
