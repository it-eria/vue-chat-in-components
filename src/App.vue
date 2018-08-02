<template>
  <div id="chat-app">
    <ChatComponent v-for="(task, idx) in tasks" :key="idx" :taskName="task.name" :taskId="task.id"></ChatComponent>
  </div>
</template>

<script>
import ChatComponent from './components/ChatComponent'
import { db, chatID } from './main'

export default {
  name: 'chat-app',
  components: {
    ChatComponent
  },
  data() {
    return {
      tasks: []
    }
  },
  firestore() {
    return {
      tasks: db.collection('tasks').orderBy('lastUpdate', 'desc')
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
