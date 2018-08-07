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
      <div class="form">
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
        <div class="b-chat__send-form__upload-btn" @change="filesChange($event)">
          <input type="file" multiple>
        </div>
        <button class="b-chat__send-form__send-btn" @click.prevent="addMessage (message)">Send</button>
      </div>
      <div class="uploaded-files-preview">
        <!-- Image miniatures -->
        <div v-for="(image, idx) in uploadedImages" :key="'img-'+idx" class="b-file b-file--photo">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="uploadedImages.splice(idx, 1);"></button>
            <img :src="image.tmpPath" alt="photo">
          </div>
          <span>{{viewName(image.name)}}</span>
        </div>        
        <!-- /Image miniatures -->
        <!-- Video miniatures -->
        <div v-for="(video, idx) in uploadedVideos" :key="'vid-'+idx" class="b-file b-file--video list-complete-item">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="uploadedVideos.splice(idx, 1);"></button>
            <img src="../assets/img/video.svg" alt="video">
          </div>
          <span>{{viewName(video.name)}}</span>
        </div>
        <!-- /Video miniatures -->
        <!-- Document miniatures -->
        <div v-for="(doc, idx) in uploadedDocuments" :key="'doc-'+idx" class="b-file b-file--document list-complete-item">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="uploadedDocuments.splice(idx, 1);"></button>
            <img src="../assets/img/document.svg" alt="document">
          </div>
          <span>{{viewName(doc.name)}}</span>
        </div>
        <!-- /Document miniatures -->
        <!-- Archives miniatures -->
        <div v-for="(archive, idx) in uploadedArchives" :key="'arch-'+idx" class="b-file b-file--archive list-complete-item">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="uploadedArchives.splice(idx, 1);"></button>
            <img src="../assets/img/archive.svg" alt="archive">
          </div>
          <span>{{viewName(archive.name)}}</span>
        </div>
        <!-- /Archives miniatures -->
      </div>
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
import mimetype from 'mimetype'
import MessageComponent from './MessageComponent'
import EmojiPicker from 'vue-emoji-picker'
import { db, st } from '../firebase'
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
      message: '',
      uploadedImages: [],
      uploadedVideos: [],
      uploadedDocuments: [],
      uploadedArchives: [],
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
      if(!!msg || (uploadedImages.length > 0) || (uploadedVideos.length > 0) 
               || (uploadedArchives.length > 0) || (uploadedDocuments.length > 0)) {
        let createdAt = firebase.database.ServerValue.TIMESTAMP; 
        db.ref(currentChatRoom+'/tasks').child(this.task.id).child('messages').push(
          {
            msg: msg, 
            createdAt: createdAt, 
            from: this.user
          });
        db.ref(currentChatRoom+'/tasks').child(this.task.id).update({lastUpdate: createdAt});        
        for(let i=0;i<this.uploadedImages;i++) {
          st.ref('upload').child(this.uploadedImages[i].name).put(this.uploadedImages[i].tmpPath);
        }
        this.message='';
      }
    },
    insert(emoji) {
      this.message += emoji
    },
    filesChange(e) {
      let filesLength = e.target.files.length;
      for(let i = 0; i < filesLength; i++) {
        let fileInf = {
          name: e.target.files[i].name,
          size: e.target.files[i].size,
          type: mimetype.lookup(e.target.files[i].name),
          tmpPath: URL.createObjectURL(e.target.files[i])
        }
        if(/image/.test(fileInf.type)) {
          this.uploadedImages.push(fileInf);
        } else if (/x-rar-compressed/.test(fileInf.type) || /zip/.test(fileInf.type)) {
          this.uploadedArchives.push(fileInf);
        } else if(/officedocument/.test(fileInf.type) || /msword/.test(fileInf.type) || /text/.test(fileInf.type) || /pdf/.test(fileInf.type)) {
          this.uploadedDocuments.push(fileInf);
        } else if(/video/.test(fileInf.type)) {
          this.uploadedVideos.push(fileInf);
        }
      }
      e.target.value = '';
    },
    viewName(str) {
      let name = str;
      if(str.length > 16) {
        let begin = str.substr(0, 7);
        let end = str.substr(str.length-7, str.length-1);
        name = begin + ' ... ' + end;
      }
      return name;
    }
  }
}
</script>

<style lang="scss">
  @import '../assets/scss/variables';
  @import '../assets/scss/b-chat';
  @import '../assets/scss/send-form';
  @import '../assets/scss/emoji';
  @import '../assets/scss/adaptive';
</style>
