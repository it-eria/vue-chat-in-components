<template>
  <div :class="[!!general ? 'b-chat b-chat--task' : null]">
    <div v-if="!general" class="b-chat__aside">
      <a href="#" class="toggle-btn" @click.prevent="collapse.collapse = !collapse.collapse"></a>
    </div>
    <div class="b-chat__title">
      <h2>{{groupName}}</h2>
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
        <div class="b-chat__send-form__upload-btn" @change="addFiles($event)">
          <input type="file" multiple>
        </div>
        <button class="b-chat__send-form__send-btn" @click.prevent="addMessage (message)">Send</button>
      </div>
      <div class="uploaded-files-preview">
        <!-- Image miniatures -->
        <div v-for="(image, idx) in files.images" :key="'img-'+idx" class="b-file b-file--photo">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="removeFile(files.images, image.newName)"></button>
            <img :src="image.preview" alt="photo">
            <div class="b-uploading" :id="'img-'+idx">
              Loading...
            </div>
          </div>
          <span>{{viewName(image.name)}}</span>
        </div>        
        <!-- /Image miniatures -->
        <!-- Video miniatures -->
        <div v-for="(video, idx) in files.videos" :key="'vid-'+idx" class="b-file b-file--video list-complete-item">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="removeFile(files.videos, video.newName)"></button>
            <img src="../assets/img/video.svg" alt="video">
            <div class="b-uploading" :id="'vid-'+idx">
              Loading...
            </div>
          </div>
          <span>{{viewName(video.name)}}</span>
        </div>
        <!-- /Video miniatures -->
        <!-- Document miniatures -->
        <div v-for="(doc, idx) in files.documents" :key="'doc-'+idx" class="b-file b-file--document list-complete-item">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="removeFile(files.documents, doc.newName)"></button>
            <img src="../assets/img/document.svg" alt="document">
            <div class="b-uploading" :id="'doc-'+idx">
              Loading...
            </div>
          </div>
          <span>{{viewName(doc.name)}}</span>
        </div>
        <!-- /Document miniatures -->
        <!-- Archives miniatures -->
        <div v-for="(archive, idx) in files.archives" :key="'arch-'+idx" class="b-file b-file--archive list-complete-item">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="removeFile(files.archives, archive.newName)"></button>
            <img src="../assets/img/archive.svg" alt="archive">
            <div class="b-uploading" :id="'arch-'+idx">
              Loading...
            </div>
          </div>
          <span>{{viewName(archive.name)}}</span>
        </div>
        <!-- /Archives miniatures -->
      </div>
    </div>
    <!-- Send form -->
  </div>
</template>

<script>
import EmojiPicker from 'vue-emoji-picker'
import mimetype from 'mimetype';
import firebase from 'firebase/app';
import { db, st, currentChatRoom, currentUser } from '../firebase'

export default {
  components: {
    EmojiPicker
  },
  props: {
    general: Boolean,
    collapse: Object,
    groupName: String,
    sendTo: String
  },
  data() {
    return {
      message: '',
      search: '',
      files: {
        images: [],
        videos: [],
        documents: [],
        archives: []
      }
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
    insert (emoji) {
      this.message += emoji;
    },
    addFiles (e) {
      let filesList = e.target.files;
      for(let i = 0; i < filesList.length; i++) {
        let fileInfo = {
          name: filesList[i].name,
          type: mimetype.lookup(filesList[i].name),
          preview: window.URL.createObjectURL(filesList[i]),
          newName: Math.floor(Math.random() * 999999999) + '-' + filesList[i].name,
          file: filesList[i],
          downloadUrl: 'Here will be generate url'
        }
        if(/image/.test(fileInfo.type)) {
          this.files.images.push(fileInfo);
        } else if (/x-rar-compressed/.test(fileInfo.type) || /zip/.test(fileInfo.type)) {
          this.files.archives.push(fileInfo);
        } else if(/officedocument/.test(fileInfo.type) || /msword/.test(fileInfo.type) || /text/.test(fileInfo.type) || /pdf/.test(fileInfo.type)) {
          this.files.documents.push(fileInfo);
        } else if(/video/.test(fileInfo.type)) {
          this.files.videos.push(fileInfo);
        }  
      }
      e.target.value = '';
    },
    removeFile(filesTypeArray, specificValue) {
      let findedIndex = 0;
      for(let i=0; i < filesTypeArray.length; i++) {
        findedIndex = i;
        if(filesTypeArray[i].newName == specificValue) break; 
      }
      filesTypeArray.splice(findedIndex, 1);
    },
    addMessage (msg) {
      let ref;
      if(this.general) {
        ref = db.ref(currentChatRoom).child('messages');
      } else {
        ref = db.ref(currentChatRoom).child('messages/'+this.sendTo).child('msgGr');
      }
      ref.push({
        updateAt: firebase.database.ServerValue.TIMESTAMP,
        from: currentUser,
        msg: msg
      });
      this.message = ''
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
  @import '../assets/scss/general';
  @import '../assets/scss/b-chat';
  @import '../assets/scss/send-form';
  @import '../assets/scss/emoji';
  @import '../assets/scss/adaptive';
</style>

