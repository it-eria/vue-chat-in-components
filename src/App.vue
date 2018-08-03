<template>
  <div id="chat-app">
    <h1>Chat is - {{ chat.name }}</h1>
    <!-- <ChatComponent v-for="(task, idx) in tasks" :key="idx" :taskName="task.name" :taskId="task.id"></ChatComponent> -->
  </div>
</template>

<script>
import TaskComponent from './components/TaskComponent'
import { db } from './main'

export default {
  name: 'chat-app',
  components: {
    TaskComponent
  },
  data () {
    return {
      tasks: [],
      chat: ''
    }
  },
  firebase: function () {
    chat: db.ref('https://test-chat-c8873.firebaseio.com/chats')
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
