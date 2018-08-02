<template>
  <!-- Send form -->
  <div class="b-chat__send-form">
    <textarea class="b-chat__send-form__textarea" placeholder="Type your message..." v-model="message"  v-on:keyup="AutoGrowTextArea($event.target)"></textarea>
    <button class="b-chat__send-form__emoji-btn"></button>
    <button class="b-chat__send-form__upload-btn"></button>
    <button class="b-chat__send-form__send-btn" v-on:click="addMessage (message, forTask, currentUser)">Send</button>
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
</template>

<script>
import { db, currentUser } from '../main'

export default {
  props: {
    forTask: String
  },
  data () {
    return {
      message: '',
      currentUser: currentUser
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
    addMessage (msg, task, user) {
      const createdAt = new Date();
      db.collection('messages').add({ msg: msg, appendToTask: task, appendToUser: user, createdAt: createdAt });
    }
  }
}
</script>

<style lang="scss">
  @import '../assets/scss/variables';
  @import '../assets/scss/send-form';
</style>
