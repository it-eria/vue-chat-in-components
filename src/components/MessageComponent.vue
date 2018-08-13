<template>
  <div :class="[!collapseMessageGroup.collapse ? 'b-chat b-chat--task' : 'b-chat b-chat--task closed']">
    <SendFormComponent v-if="message.msgGr" :general="false" :collapse="collapseMessageGroup" :groupName="message.groupName" :sendTo="message.id"></SendFormComponent>
    <!-- Grouped messages template -->
    <div v-if="message.msgGr">
      <div v-for="grMessage in messageArr" v-if="grMessage.from" :key="grMessage.id" class="b-chat__message b-chat__task">
        <div class="b-chat__message__user-avatar">
          <img v-bind:src="users[grMessage.from].avatar || require('../assets/img/default-avatar.png')" alt="user avatar">
        </div>
        <div class="b-chat__message__inf-line">
          <h4>{{users[grMessage.from].name}}</h4>
          <span>{{getDate(grMessage.updateAt)}}</span>
          <span>{{getTime(grMessage.updateAt)}}</span>
        </div>
        <div class="b-chat__message__message-line">
          <p v-html="findLinksInMessage(grMessage.msg)"></p>
        </div>
        <div v-if="grMessage.files" class="b-chat__message__files-line">
          <div class="non-photos">
            <a :href="getDownloadLink(video.newName)"  v-for="(video, idx) in grMessage.files.videos" :key="'vid-'+idx" class="file-link file-link--video" target="_blank">
              <img src="../assets/img/video.svg" alt="video">
              <span>{{viewName(video.name)}}</span>
            </a>
            <a :href="getDownloadLink(document.newName)" v-for="(document, idx) in grMessage.files.documents" :key="'doc-'+idx" class="file-link file-link--document" target="_blank">
              <img src="../assets/img/document.svg" alt="document">
              <span>{{viewName(document.name)}}</span>
            </a>
            <a :href="getDownloadLink(archive.newName)" v-for="(archive, idx) in grMessage.files.archives" :key="'arch-'+idx" class="file-link file-link--archive">
              <img src="../assets/img/archive.svg" alt="archive">
              <span>{{viewName(archive.name)}}</span>
            </a>
          </div>
          <div class="photos">
            <a :href="getDownloadLink(image.newName)" v-for="(image, idx) in grMessage.files.images" :key="'img-'+idx" target="_blank">
              <img :src="getDownloadLink(image.newName)" alt="photo" >
            </a>
          </div> 
        </div>
      </div>
    </div>
    <!-- /Grouped messages template -->
    <!-- General messages template -->
    <div v-if="!message.msgGr && message.from">
      <div class="b-chat__message b-chat__task">
        <div class="b-chat__message__user-avatar">
          <img v-bind:src="users[message.from].avatar || require('../assets/img/default-avatar.png')" alt="user avatar">
        </div>
        <div class="b-chat__message__inf-line">
          <h4>{{users[message.from].name}}</h4>
          <span>{{getDate(message.updateAt)}}</span>
          <span>{{getTime(message.updateAt)}}</span>
        </div>
        <div class="b-chat__message__message-line">
          <p v-html="findLinksInMessage(message.msg)"></p>
        </div>
        <div v-if="message.files" class="b-chat__message__files-line">
          <pre>
            {{message.files}}
          </pre>
          <div class="non-photos">
            <a :href="getDownloadLink(video.newName)"  v-for="(video, idx) in message.files.videos" :key="'vid-'+idx" class="file-link file-link--video" target="_blank">
              <img src="../assets/img/video.svg" alt="video">
              <span>{{viewName(video.name)}}</span>
            </a>
            <a :href="document.downloadUrl" v-for="(document, idx) in message.files.documents" :key="'doc-'+idx" class="file-link file-link--document" target="_blank">
              <img src="../assets/img/document.svg" alt="document">
              <span>{{viewName(document.name)}}</span>
            </a>
            <a :href="getDownloadLink(archive.newName)" v-for="(archive, idx) in message.files.archives" :key="'arch-'+idx" class="file-link file-link--archive">
              <img src="../assets/img/archive.svg" alt="archive">
              <span>{{viewName(archive.name)}}</span>
            </a>
          </div>
          <div class="photos">
            <a :href="image.downloadUrl" v-for="(image, idx) in message.files.images" :key="'img-'+idx" target="_blank">
              <img :src="image.downloadUrl" alt="photo" >
            </a>
          </div> 
        </div>
      </div>
    </div>
    <!-- /General messages template -->
  </div>
</template>

<script>
import SendFormComponent from './SendFormComponent'
import { db, st } from '../firebase'
import anchorme from 'anchorme'

export default {
  components: {
    SendFormComponent
  },
  props: {
    message: Object,
    users: Object
  },
  data () {
    return {
      collapseMessageGroup: {
        collapse: true
      },
      imageLinks: {}
    }
  },
  computed: {
    messageArr: function() {
      let arr = [];
      for(let key in this.message.msgGr) {
        let obj = this.message.msgGr[key];
        obj.id = key;
        arr.push(obj);
      }
      return arr.reverse();
    }
  },
  created () {
    
  },
  methods: {
    getDate (sec) {
      let temp_date = new Date(sec);
      let year = temp_date.getFullYear();
      let temp_month = temp_date.getMonth();
      let temp_day = temp_date.getDate();
      let month = (+temp_month + 1 < 10) ? ('0' + (+temp_month + 1)) : (+temp_month + 1);
      let day = (+temp_day < 10) ? ('0' + temp_day) : temp_day;
      return year + '.' + month + '.' + day
    },
    getTime (sec) {
      let temp_date = new Date(sec);
      let hour = temp_date.getHours();
      let temp_min = temp_date.getMinutes();
      let min = (+temp_min < 10) ? ('0' + temp_min) : temp_min;
      return hour + ':' + min
    },
    viewName(str) {
      let name = str;
      if(str.length > 16) {
        let begin = str.substr(0, 7);
        let end = str.substr(str.length-7, str.length-1);
        name = begin + ' ... ' + end;
      }
      return name;
    },
    findLinksInMessage(str) {
      let options = {
        truncate: [26,15],
        attributes: [
          {
            name: 'class',
            value: 'message__link'
          },
          {
            name: 'target',
            value: 'blank'
          }
        ],
        defaultProtocol:"https://"
      }
      return anchorme(str, options);
    },
    getDownloadLink(child) {
      
    }
  }
}
</script>

<style lang="scss">
  @import '../assets/scss/variables';
  @import '../assets/scss/b-message';
  @import '../assets/scss/adaptive';
</style>
