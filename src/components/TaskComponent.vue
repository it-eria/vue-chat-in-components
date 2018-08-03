<template>
  <!-- Chat -->
    <div :class="[taskName ? 'b-chat b-chat--task' : 'b-chat', isClosed ? 'closed': '']">
      <div class="b-chat__aside">
        <a href="#" v-if="taskName" v-on:click="isClosed = !isClosed" class="toggle-btn"></a>
      </div>
      <div v-if="taskName" class="b-chat__title">
        <h2>{{ taskName }}</h2>
      </div>
      <!-- Send form -->
      <div class="b-chat__send-form">
        <textarea class="b-chat__send-form__textarea" placeholder="Type your message..." v-model="message"  v-on:keyup="AutoGrowTextArea($event.target)"></textarea>
        <button class="b-chat__send-form__emoji-btn"></button>
        <button class="b-chat__send-form__upload-btn"></button>
        <button class="b-chat__send-form__send-btn" v-on:click="addMessage (message)">Send</button>
        <!-- <div class="uploaded-files-preview">
          <div class="b-file b-file--photo">
            <button class="close-btn"></button>
            <img src="../assets/img/upload-1.jpg" alt="photo">
            <span>image-1.jpg</span>
          </div>
          <div class="b-file b-file--video">
            <button class="close-btn"></button>
            <img src="../assets/img/video.svg" alt="video">
            <span>movie-1.avi</span>
          </div>
          <div class="b-file b-file--document">
            <button class="close-btn"></button>
            <img src="../assets/img/document.svg" alt="document">
            <span>file-1.doc</span>
          </div>
          <div class="b-file b-file--archive">
            <button class="close-btn"></button>
            <img src="../assets/img/archive.svg" alt="archive">
            <span>archive-1.rar</span>
          </div>
        </div> -->
      </div>
      <!-- /Send form -->
      <div>
        <MessageComponent v-for="(message, idx) in messages" :key="idx" :message="message"></MessageComponent>
      </div>
    </div>
    <!-- /Chat -->
</template>

<script>
import SendFormComponent from './SendFormComponent'
import MessageComponent from './MessageComponent'
import firebase from 'firebase/app'
import { db } from '../main'

export default {
  components: {
    SendFormComponent,
    MessageComponent
  },
  props: {
    taskName: String,
    taskId: String,
    currentUser: String
  },
  data () {
    return {
      isClosed: true,
      message: '',
      messages: []
    }
  },
  firestore () {
    return {
      messages: db.collection('messages').where('appendToTask', '==', this.taskId).orderBy('createdAt', 'desc')
    }
  },
  methods: {
    AutoGrowTextArea (textField) {
      if (textField.clientHeight < textField.scrollHeight) {
        textField.style.height = textField.scrollHeight + 'px'
        if (textField.clientHeight < textField.scrollHeight) {
          textField.style.height = (textField.scrollHeight * 2 - textField.clientHeight) + 'px'
        }
      }
    },
    addMessage (msg) {
      const createdAt = new Date();
      const sendObj = { msg: msg, appendToTask: this.taskId, appendToUser: currentUser, createdAt: createdAt };
      this.$firestoreRefs.messages.add(sendObj);
    }
  }
}
</script>

<style lang="scss">
  @import '../assets/scss/variables';
  @import '../assets/scss/b-chat';
</style>
