<template>
  <!-- Chat -->
    <div :class="[taskName ? 'b-chat b-chat--task' : 'b-chat', isClosed ? 'closed': '']">
      <div class="b-chat__aside">
        <a href="#" v-if="taskName" v-on:click="isClosed = !isClosed" class="toggle-btn"></a>
      </div>
      <div v-if="taskName" class="b-chat__title">
        <h2>{{ taskName }}</h2>
      </div>
      <SendFormComponent :forTask="taskId"></SendFormComponent>
      <div>
        <MessageComponent v-for="(message, idx) in messages" :key="idx" :message="message"></MessageComponent>
      </div>
    </div>
    <!-- /Chat -->
</template>

<script>
import SendFormComponent from './SendFormComponent'
import MessageComponent from './MessageComponent'
import { db } from '../main'

export default {
  components: {
    SendFormComponent,
    MessageComponent
  },
  props: {
    taskName: String,
    taskId: String
  },
  data () {
    return {
      messages: [],
      isClosed: true
    }
  },
  firestore () {
    return {
      messages: db.collection('messages').where('appendToTask', '==', this.taskId).orderBy('createdAt', 'desc')
    }
  }
}
</script>

<style lang="scss">
  @import '../assets/scss/variables';
  @import '../assets/scss/b-chat';
</style>
