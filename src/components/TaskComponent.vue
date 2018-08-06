<template>
  <!-- Chat -->
  <div :class="[task.name ? 'b-chat b-chat--task' : 'b-chat', isClosed ? 'closed': '']">
    <div class="b-chat__aside">
      <a href="#" v-if="task.name" v-on:click.prevent="isClosed = !isClosed" class="toggle-btn"></a>
    </div>
    <div v-if="task.name" class="b-chat__title">
      <h2>{{ task.name }}</h2>
    </div>
    <!-- Send form -->
    <div class="b-chat__send-form">
      <textarea class="b-chat__send-form__textarea" placeholder="Type your message..." v-model="message"  v-on:keyup="AutoGrowTextArea($event.target)"></textarea>
      <emoji-picker @emoji="insert" :search="search" class="b-chat__send-form__emoji-btn">
        <button class="emoji--toggle-popup" slot="emoji-invoker" slot-scope="{ events }" v-on="events"></button>
        <div slot="emoji-picker" slot-scope="{ emojis, insert, display }">
          <div class="emoji-picker">
            <div class="emoji-picker__search">
              <input type="text" v-model="search">
            </div>
            <div>
              <div v-for="(emojiGroup, category) in emojis" :key="category">
                <h5>{{ category }}</h5>
                <div class="emojis">
                  <span
                    v-for="(emoji, emojiName) in emojiGroup"
                    :key="emojiName"
                    @click="insert(emoji)"
                    :title="emojiName"
                        >{{ emoji }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </emoji-picker>
      <button class="b-chat__send-form__upload-btn"></button>
      <button class="b-chat__send-form__send-btn" v-on:click.prevent="addMessage (message)">Send</button>
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
      <transition-group name="list" tag="div">
        <MessageComponent v-for="message in messages" :key="message.id" :message="message"></MessageComponent>
      </transition-group>
    </div>
  </div>
  <!-- /Chat -->
</template>

<script>
import firebase from 'firebase/app'
import MessageComponent from './MessageComponent'
import EmojiPicker from 'vue-emoji-picker'
import { db } from '../firebase'
import { currentChatRoom } from '../main';

export default {
  components: {
    MessageComponent,
    EmojiPicker
  },
  props: {
    task: Object,
    user: String
  },
  data () {
    return {
      isClosed: true,
      messages: [],
      search: '',
      message: ''
    }
  },
  created () {
    let _this = this;
    db.ref(currentChatRoom+'/tasks').child(this.task.id).child('messages').orderByChild('createdAt').on('value', function(snapshot) {
      _this.messages = [];
      snapshot.forEach(function(child) {
        _this.messages.unshift(
          {
            id: child.key, 
            createdAt: child.val().createdAt,
            from: child.val().from,
            message: child.val().msg
          });
      });
    });
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
    addMessage(msg) {
      let createdAt = firebase.database.ServerValue.TIMESTAMP; 
      db.ref(currentChatRoom+'/tasks').child(this.task.id).child('messages').push(
        {
          msg: msg, 
          createdAt: createdAt, 
          from: this.user
        });
      db.ref(currentChatRoom+'/tasks').child(this.task.id).update({lastUpdate: createdAt});
      this.message='';
    },
    insert(emoji) {
      this.message += emoji
    }
  }
}
</script>

<style lang="scss">
  @import '../assets/scss/variables';
  @import '../assets/scss/b-chat';
  @import '../assets/scss/emoji';
  @import '../assets/scss/adaptive';
</style>
