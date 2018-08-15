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
          <label for="upload-files"></label>
          <input type="file" multiple id="upload-files">
        </div>
        <button class="b-chat__send-form__send-btn" @click.prevent="addMessage (message)">Send</button>
      </div>
      <div class="uploaded-files-preview">
        <!-- Files miniature -->
        <transition-group name="list-complete" tag="div">
          <div v-for="file in filesBuffer" :key="file.id" :class="getClass(file.type)">
            <div class="img-miniature">
              <button class="close-btn" @click.prevent="removeFile(file.id)"></button>
              <img :src="file.preview ? file.preview : getIconPath(file.type)" alt="thumbnail">
              <div class="b-uploading" :id="file.id">
                Loading...
              </div>
            </div>
            <span>{{viewName(file.name)}}</span>
          </div>
        </transition-group>
        <!-- /Files miniature -->
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
      filesBuffer: [],
      isFilesUploaded: false
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
    getClass(fileType) {
      let returnClasses = 'list-complete-item b-file';
      if(fileType == 'image') {
        returnClasses += ' b-file--photo'
      } else {
        returnClasses += ' list-complete-item b-file--'+fileType
      }
      return returnClasses;
    },
    getIconPath(fileType) {
      let iconName = '';
      switch(fileType) {
        case 'video':
          iconName = 'video.svg';
          break; 
        case 'archive': 
          iconName = 'archive.svg';
          break;
        case 'document':
          iconName = 'document.svg';
          break;
      }
      return require('../assets/img/' + iconName);
    },
    addFiles (e) {
      if(this.isFilesUploaded) {
        this.filesBuffer = [];
        this.isFilesUploaded = false;
      }
      let files = e.target.files;
      for(let i = 0; i < files.length; i++) {
        let rnd = Math.floor(Math.random() * 999999999);
        let type = '';
        let mime = mimetype.lookup(files[i].name);
        let preview = null;
        if(/image/.test(mime)) {
          type = 'image';
          preview = window.URL.createObjectURL(files[i]);
        } else if (/x-rar-compressed/.test(mime) || /zip/.test(mime)) {
          type = 'archive';
        } else if(/officedocument/.test(mime) || /msword/.test(mime) || /text/.test(mime) || /pdf/.test(mime)) {
          type = 'document';
        } else if(/video/.test(mime)) {
          type = 'video';
        }
        this.filesBuffer.push({
          id: rnd,
          name: files[i].name,
          newName: rnd + files[i].name,
          type: type,
          preview: preview,
          file: files[i],
          downloadUrl: ''
        }); 
      }
      e.target.value = '';
    },
    removeFile(id) {
      let findedIndex = 0;
      for(let i=0; i < this.filesBuffer.length; i++) {
        findedIndex = i;
        if(this.filesBuffer[i].id == id) break; 
      }
      this.filesBuffer.splice(findedIndex, 1);
    },
    addMessage(msg) {
      let _this = this;
      let updateAt = firebase.database.ServerValue.TIMESTAMP;
      let child = this.general ? 'messages' : 'messages/'+this.sendTo+'/msgGr';
      let ref = db.ref(currentChatRoom).child(child).push();
      if(this.isFilesUploaded) {
        this.filesBuffer = [];
        this.isFilesUploaded = false;
      }
      if(!this.general) {
        db.ref(currentChatRoom).child('messages/'+this.sendTo).update({updateAt: updateAt});
      }
      if(this.filesBuffer.length > 0) {
        let checkCount = 0;
        for(let i=0; i < this.filesBuffer.length; i++) {
          document.getElementById(_this.filesBuffer[i].id).style.opacity = 1;
          st.ref('upload').child(this.filesBuffer[i].newName).put(this.filesBuffer[i].file)
          .then(res => {
            document.getElementById(_this.filesBuffer[i].id).classList.add('b-uploading--success');
            document.getElementById(_this.filesBuffer[i].id).innerHTML = 'Success';
            return res.ref.getDownloadURL();
          }).then(url => {
            document.getElementById(_this.filesBuffer[i].id).parentNode.parentNode.style.display = 'none';
            checkCount++;
            _this.filesBuffer[i].downloadUrl = url;
            if(checkCount == _this.filesBuffer.length) {
              ref.update({
                msg: msg,
                from: currentUser,
                updateAt: updateAt,
                files: _this.filesBuffer     
              });
              this.message = '';
              this.isFilesUploaded = true;
            }
          });          
        }
      } else {
        ref.update({
          msg: msg,
          from: currentUser,
          updateAt: updateAt
        });
        this.message = '';
      }
      document.getElementById('chat-app').scrollTo(0, 0);
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
  .list-complete-item {
    transition: all .5s ease-in-out;
  }
  .list-complete-enter, .list-complete-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
  .list-complete-leave-active {
    position: absolute !important;
  }
  .toggle-btn {
    transition: all .3s ease-in-out;
  }
</style>

