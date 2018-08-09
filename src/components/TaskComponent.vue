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
        <div v-for="(image, idx) in images" :key="'img-'+image.id" class="b-file b-file--photo">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="images.splice(idx, 1)"></button>
            <img :src="image.preview" alt="photo">
            <div class="b-uploading" :id="'img-'+image.id">
              Loading...
            </div>
          </div>
          <span>{{viewName(image.name)}}</span>
        </div>        
        <!-- /Image miniatures -->
        <!-- Video miniatures -->
        <div v-for="(video, idx) in videos" :key="'vid-'+video.id" class="b-file b-file--video list-complete-item">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="videos.splice(idx, 1)"></button>
            <img src="../assets/img/video.svg" alt="video">
            <div class="b-uploading" :id="'vid-'+video.id">
              Loading...
            </div>
          </div>
          <span>{{viewName(video.name)}}</span>
        </div>
        <!-- /Video miniatures -->
        <!-- Document miniatures -->
        <div v-for="(doc, idx) in documents" :key="'doc-'+doc.id" class="b-file b-file--document list-complete-item">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="documents.splice(idx, 1)"></button>
            <img src="../assets/img/document.svg" alt="document">
            <div class="b-uploading" :id="'doc-'+doc.id">
              Loading...
            </div>
          </div>
          <span>{{viewName(doc.name)}}</span>
        </div>
        <!-- /Document miniatures -->
        <!-- Archives miniatures -->
        <div v-for="(archive, idx) in archives" :key="'arch-'+archive.id" class="b-file b-file--archive list-complete-item">
          <div class="img-miniature">
            <button class="close-btn" @click.prevent="archives.splice(idx, 1)"></button>
            <img src="../assets/img/archive.svg" alt="archive">
            <div class="b-uploading" :id="'arch-'+archive.id">
              Loading...
            </div>
          </div>
          <span>{{viewName(archive.name)}}</span>
        </div>
        <!-- /Archives miniatures -->
      </div>
    </div>
    <!-- /Send form -->
    <div>
      <transition-group name="list" tag="div">
        <MessageComponent v-for="messageItem in messages" :key="messageItem.id" :message="messageItem"></MessageComponent>
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
      documents: [],
      files: {
        images: [],
        videos: [],
        archives: [],
        documents: []
      }
    }
  },
  created () {
    let _this = this;
    db.ref(currentChatRoom+'/tasks').child(this.task.id).child('messages').orderByChild('createdAt').on('value', function(snapshot) {
      _this.messages = [];
      _this.images = [];
      _this.archives = [];
      _this.documents = [];
      _this.videos = [];
      snapshot.forEach(function(child) {
        _this.messages.unshift(
          {
            id: child.key, 
            createdAt: child.val().createdAt,
            from: child.val().from,
            message: child.val().msg,
            files: child.val().files
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
      let _this = this;
      let files = {
        images: this.images,
        videos: this.videos,
        archives: this.archives,
        documents: this.documents
      };
      let newMessage = db.ref(currentChatRoom+'/tasks').child(this.task.id).child('messages').push();
      let createdAt = firebase.database.ServerValue.TIMESTAMP;
      if(!!this.images.length || !!this.archives.length || !!this.videos.length || !!this.documents.length) {
        return new Promise ((resolve, reject) => {
          for(let key in files) {
            for(let i=0; i<files[key].length; i++) {
              let idPrefix;
              let obj;
              switch (key) {
                case 'images':
                  idPrefix = 'img-';
                  obj = _this.images;
                  break;
                case 'videos':
                  idPrefix = 'vid-';
                  obj = _this.videos;
                  break;
                case 'archives':
                  idPrefix = 'arch-';
                  obj = _this.archives;
                  break;
                case 'documents':
                  idPrefix = 'doc-';
                  obj = _this.documents;
                  break;
              }
              let el = document.getElementById(idPrefix + files[key][i].id);
              let uploadTask = st.ref('upload').child(files[key][i].newName).put(files[key][i].file);
              uploadTask.on('state_changed', function(snapshot) {
                el.style.opacity = 1;
                switch (snapshot.state) {
                  case firebase.storage.TaskState.PAUSED: // or 'paused'
                    el.innerText = 'Paused';
                    break;
                  case firebase.storage.TaskState.RUNNING: // or 'running'
                    el.innerText = 'Loading...';
                    break;
                }
              }, function(error) {
                el.classList.add('b-uploading--err');
                el.innerText = "Error";
              }, function() {
                uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                  files[key][i].downloadUrl = downloadURL;
                  el.classList.add('b-uploading--success');
                  el.innerText = "Success";
                  return new Promise ((resolve, reject) => {
                    setTimeout(function() {
                      el.parentNode.parentNode.remove();
                      resolve(files);
                    }, 1000);
                  });
                }).then(files => {
                  newMessage.update({
                    msg: msg, 
                    createdAt: createdAt, 
                    from: _this.user,
                    files: files
                  });
                });
              });
            }
          }
          resolve(files);
        }).then(files => {
          this.message = '';
          db.ref(currentChatRoom+'/tasks').child(this.task.id).update({lastUpdate: createdAt});
        });
      } else {
        newMessage.update({
          msg: msg, 
          createdAt: createdAt, 
          from: this.user
        });
        this.message = '';
        db.ref(currentChatRoom+'/tasks').child(this.task.id).update({lastUpdate: createdAt});
      }
    },
    insert(emoji) {
      this.message += emoji;
    },
    filesChange(e) {     
      for(let i = 0; i < e.target.files.length; i++) {
        let file = e.target.files[i];
        let fileInf = {
          id: i,
          name: file.name,
          type: mimetype.lookup(file.name),
          preview: window.URL.createObjectURL(file),
          newName: Math.floor(Math.random() * 999999999) + '-' + file.name,
          file: file,
          downloadUrl: 'Here will be generate url'
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
      // e.target.value = '';
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
