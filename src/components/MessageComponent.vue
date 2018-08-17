<template>
  <div :class="[!collapseMessageGroup.collapse ? 'b-chat b-chat--single b-chat--task' : 'b-chat b-chat--single b-chat--task closed']">
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
            <a v-if="!(file.type == 'image')" :href="file.downloadUrl" v-for="file in grMessage.files" :key="file.id" :class="getFileMiniatureClass(file.type)" target="_blank">
              <img :src="getIconPath(file.type)" alt="video">
              <span>{{viewName(file.name)}}</span>
            </a>
          </div>
          <div class="photos">
            <a v-if="file.type == 'image'" :href="file.downloadUrl" v-for="file in grMessage.files" :key="file.id" target="_blank">
              <img :src="file.downloadUrl" :alt="file.name" >
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
        <div class="b-chat__message__message-line" :id="'msg-' + message.updateAt">
          <p v-html="findLinksInMessage(message.msg, 'msg-' + message.updateAt)"></p>
        </div>
        <div v-if="message.files" class="b-chat__message__files-line">
          <div class="non-photos">
            <a v-if="!(file.type == 'image')" :href="file.downloadUrl" v-for="file in message.files" :key="file.id" :class="getFileMiniatureClass(file.type)" target="_blank">
              <img :src="getIconPath(file.type)" alt="video">
              <span>{{viewName(file.name)}}</span>
            </a>
          </div>
          <div class="photos">
            <a v-if="file.type == 'image'" :href="file.downloadUrl" v-for="file in message.files" :key="file.id" target="_blank">
              <img :src="file.downloadUrl" :alt="file.name" >
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
import AutoLinker from 'autolinker'
import cheerio from 'cheerio'
import request from 'request'
import { db, st, currentChatRoom } from '../firebase'



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
      submessages: []
    }
  },
  computed: {
    messageArr: function() {
      let arr = [];
      for(let key in this.submessages) {
        let obj = this.submessages[key];
        obj.id = key;
        arr.push(obj);
      }
      return arr;
    }
  },
  created () {
    let _this = this;
    if(this.message.msgGr) {
      db.ref(currentChatRoom).child('messages/'+this.message.id).child('msgGr').orderByChild('updateAt').on('value', function(snap) {
        _this.submessages = [];
        snap.forEach(function(child) {
          let obj = child.val();
          obj['id'] = child.key;
          _this.submessages.unshift(obj);
        });
      });
    }
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
    getFileMiniatureClass(fileType) {
      return 'file-link file-link--' + fileType;
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
    findLinksInMessage(str, id) {
      let newStr = AutoLinker.link(str, { className: "link-at-message" });
      let tempElement = document.createElement('div')
      tempElement.innerHTML = newStr;
      let linksCount = tempElement.querySelectorAll('a').length;
      if(linksCount) {
        let lastLink = tempElement.querySelectorAll('a')[linksCount-1];
        let lastLinkUrl = lastLink.href;
        let prefix = 'https://';
        if(/https:\/\//g.test(lastLinkUrl) || /http:\/\//g.test(lastLinkUrl)) {
          prefix = '';
        }
        let options = {
          url: prefix + lastLinkUrl,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-type,Accept,X-Access-Token,X-Key"
          }
        }
        request.get(options, function (error, response, html) {
          if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);
            let meta = {
              ogTitle: $('meta[property="og:title"]').attr("content"),
              ogUrl: $('meta[property="og:url"]').attr("content"),
              ogImage: $('meta[property="og:image"]').attr("content"),
              ogImageAlt: $('meta[property="og:image:alt"]').attr("content"),
              ogDescription: $('meta[property="og:description"]').attr("content")
            }
            if(document.getElementById(id).querySelectorAll('.og-meta').length == 0 && meta.ogTitle) {
              tempElement.innerHTML = `
                <a href="${meta.ogUrl || ''}" target="_blank" class="og-meta">
                  <div class="og-meta__img">
                      <img src="${meta.ogImage || 'no-src'}" alt="${meta.ogImageAlt}">
                  </div>
                  <div class="og-meta__inf">
                    <span>${meta.ogUrl || lastLinkUrl}</span>
                    <h4>${meta.ogTitle || ''}</h4>
                    <p>${meta.ogDescription || ''}</p>
                  </div>
                </a>`;
              document.getElementById(id).appendChild(tempElement);
            }
          }
        });
      }
      return newStr;
    }
  }
}
</script>

<style lang="scss">
  @import '../assets/scss/variables';
  @import '../assets/scss/b-message';
  @import '../assets/scss/adaptive';
  .toggle-btn {
    transition: all .3s ease-in-out;
  }
</style>
