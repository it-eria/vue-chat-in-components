<template>
  <div :class="[!!collapseMessageGroup.collapse ? 'b-chat b-chat--task' : 'b-chat b-chat--task closed']">
    <SendFormComponent v-if="message.msgGr" :general="false" :collapse="collapseMessageGroup"></SendFormComponent>
    <div>
      <div class="b-chat__message b-chat__task">
        <div class="b-chat__message__user-avatar">
          <!-- <img v-bind:src="avatarUrl ? avatarUrl : require('../assets/img/default-avatar.png')" alt="user avatar"> -->
          <img src="../assets/img/default-avatar.png" alt="user avatar">
        </div>
        <div class="b-chat__message__inf-line">
          <h4>User name</h4>
          <span>getDate(updateAt)</span>
          <span>getTime(updateAt)</span>
        </div>
        <div class="b-chat__message__message-line">
          <!-- <p v-html="findLinksInMessage(message.message, message.id)"></p> -->
          <p>Message</p>
        </div>
        <!-- <div v-if="message.files" class="b-chat__message__files-line">
          <div class="non-photos">
            <a :href="video.downloadUrl"  v-for="(video, idx) in message.files.videos" :key="'vid-'+idx" class="file-link file-link--video" target="_blank">
              <img src="../assets/img/video.svg" alt="video">
              <span>{{viewName(video.name)}}</span>
            </a>
            <a :href="document.downloadUrl" v-for="(document, idx) in message.files.documents" :key="'doc-'+idx" class="file-link file-link--document" target="_blank">
              <img src="../assets/img/document.svg" alt="document">
              <span>{{viewName(document.name)}}</span>
            </a>
            <a :href="archive.downloadUrl" v-for="(archive, idx) in message.files.archives" :key="'arch-'+idx" class="file-link file-link--archive">
              <img src="../assets/img/archive.svg" alt="archive">
              <span>{{viewName(archive.name)}}</span>
            </a>
          </div>
          <div class="photos">
            <a :href="image.downloadUrl" v-for="(image, idx) in message.files.images" :key="'img-'+idx" target="_blank">
              <img :src="image.downloadUrl" alt="photo" >
            </a>
          </div> 
        </div> -->
      </div>
    </div>
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
    message: Object
  },
  data () {
    return {
      user: {},
      avatarUrl: '',
      collapseMessageGroup: {
        collapse: true
      }
    }
  },
  created () {
    // let _this = this;
    // db.ref('users').child(this.message.from).once('value', function(snapshot) {
    //   _this.user = snapshot.val();
    //   st.ref('avatars').child(_this.user.avatar).getDownloadURL().then(url => _this.avatarUrl = url);
    // });
  },
  methods: {
    // getDate (sec) {
    //   let temp_date = new Date(sec);
    //   let year = temp_date.getFullYear();
    //   let temp_month = temp_date.getMonth();
    //   let temp_day = temp_date.getDate();
    //   let month = (+temp_month + 1 < 10) ? ('0' + (+temp_month + 1)) : (+temp_month + 1);
    //   let day = (+temp_day < 10) ? ('0' + temp_day) : temp_day;
    //   return year + '.' + month + '.' + day
    // },
    // getTime (sec) {
    //   let temp_date = new Date(sec);
    //   let hour = temp_date.getHours();
    //   let temp_min = temp_date.getMinutes();
    //   let min = (+temp_min < 10) ? ('0' + temp_min) : temp_min;
    //   return hour + ':' + min
    // },
    // viewName(str) {
    //   let name = str;
    //   if(str.length > 16) {
    //     let begin = str.substr(0, 7);
    //     let end = str.substr(str.length-7, str.length-1);
    //     name = begin + ' ... ' + end;
    //   }
    //   return name;
    // },
    // findLinksInMessage(str, id) {
    //   // let ogmetadatas = [];
    //   let options = {
    //     truncate: [26,15],
    //     attributes: [
    //       {
    //         name: 'class',
    //         value: 'message__link'
    //       },
    //       {
    //         name: 'target',
    //         value: 'blank'
    //       }
    //     ],
    //     defaultProtocol:"https://"
    //   }
      // let list = anchorme(str, {list: true});
      // list.forEach(function(item) {
      //   return new Promise ((response, reject) => {
      //     let url = item.protocol + item.encoded;
      //     og(url, function(err, meta){
      //       if(meta) {
      //         ogmetadatas.push({id: id, meta: meta});
      //       }
      //       response(ogmetadatas);
      //     });
      //   }).then(ogmetadatas => {
      //     for(var i=0; i<ogmetadatas.length; i++) {
      //       let el = document.getElementById(id);
      //       let image = document.createElement('img');
      //       image.src = ogmetadatas[i].meta.image.url;
      //       el.insertBefore(image);
      //     }
      //   });
      // });
      // return anchorme(str, options);
    // }
  }
}
</script>

<style lang="scss">
  @import '../assets/scss/variables';
  @import '../assets/scss/b-message';
  @import '../assets/scss/adaptive';
</style>
