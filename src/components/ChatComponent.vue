<template>
  <!-- Chat -->
    <div :class="[taskName ? 'b-chat b-chat--task closed' : 'b-chat']">
      <div class="b-chat__aside">
        <a href="#" v-if="taskName" class="toggle-btn"></a>
      </div>
      <div v-if="taskName" class="b-chat__title">
        <h2>{{ taskName }}</h2>
      </div>
      <SendFormComponent></SendFormComponent>
      <MessageComponent v-for="(message, idx) in messages" :key="idx" :message="message"></MessageComponent>
    </div>
    <!-- /Chat -->
</template>

<script>
import SendFormComponent from './SendFormComponent';
import MessageComponent from './MessageComponent';
import { db } from '../main';

export default {
  components: {
    SendFormComponent,
    MessageComponent
  },
  props: {
    taskName: String,
    taskId: String
  },
  data() {
    return {
      messages: []
    }
  },
  firestore() {
    return {
      messages: db.collection('messages').where('appendToTask', '==', this.taskId)
    }
  }
}
</script>

<style lang="scss">
  @import '../assets/scss/variables';
  @import '../assets/scss/b-chat';
</style>


