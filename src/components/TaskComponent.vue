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
        <div v-for="(image, idx) in images" :key="'img-'+idx" class="b-file b-file--photo">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="images.splice(idx, 1)"></button>
            <img :src="image.blob" alt="photo">
          </div>
          <span>{{viewName(image.name)}}</span>
        </div>        
        <!-- /Image miniatures -->
        <!-- Video miniatures -->
        <div v-for="(video, idx) in videos" :key="'vid-'+idx" class="b-file b-file--video list-complete-item">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="videos.splice(idx, 1)"></button>
            <img src="../assets/img/video.svg" alt="video">
          </div>
          <span>{{viewName(video.name)}}</span>
        </div>
        <!-- /Video miniatures -->
        <!-- Document miniatures -->
        <div v-for="(doc, idx) in documents" :key="'doc-'+idx" class="b-file b-file--document list-complete-item">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="documents.splice(idx, 1)"></button>
            <img src="../assets/img/document.svg" alt="document">
          </div>
          <span>{{viewName(doc.name)}}</span>
        </div>
        <!-- /Document miniatures -->
        <!-- Archives miniatures -->
        <div v-for="(archive, idx) in archives" :key="'arch-'+idx" class="b-file b-file--archive list-complete-item">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="archives.splice(idx, 1)"></button>
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
      images: [],
      videos: [],
      archives: [],
      documents: []
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
      if(!!msg) {
        let createdAt = firebase.database.ServerValue.TIMESTAMP;
        let files = null;
        // Upload images
        for(let i=0; i<this.images.length; i++) {
          let fileName = new Date().getTime() + '-' + this.images[i].name;
          let uploadTask = st.ref('uploads').put(this.images[i].blob);
          uploadTask.on('state_changed', function(snapshot) {
            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
              case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
            }
          }, function(error) {

          }, function() {
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
              console.log('File available at', downloadURL);
            });
          });
        }
        db.ref(currentChatRoom+'/tasks').child(this.task.id).child('messages').push(
          {
            msg: msg, 
            createdAt: createdAt, 
            from: this.user,
            files: files
          });
        db.ref(currentChatRoom+'/tasks').child(this.task.id).update({lastUpdate: createdAt});
        this.message='';
      }
    },
    insert(emoji) {
      this.message += emoji
    },
    filesChange(e) {
      for(let i = 0; i < e.target.files.length; i++) {
        let fileInf = {
          name: e.target.files[i].name,
          type: mimetype.lookup(e.target.files[i].name),
          blob: URL.createObjectURL(e.target.files[i])
        }
        if(/image/.test(fileInf.type)) {
          this.images.push(fileInf);
        } else if (/x-rar-compressed/.test(fileInf.type) || /zip/.test(fileInf.type)) {
          this.archives.push(fileInf);
        } else if(/officedocument/.test(fileInf.type) || /msword/.test(fileInf.type) || /text/.test(fileInf.type) || /pdf/.test(fileInf.type)) {
          this.documents.push(fileInf);
        } else if(/video/.test(fileInf.type)) {
          this.videos.push(fileInf);
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
