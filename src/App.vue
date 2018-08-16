<template>
  <div id="chat-app" @scroll="loadMore($event)" v-if="(Object.keys(users).length > 0) && (messages.length > 0)">
    <SendFormComponent :general="true"></SendFormComponent>
    <transition-group name="flip-list" tag="div">
      <MessageComponent v-for="message in messages" :key="message.id" :message="message" :users="users"></MessageComponent>
    </transition-group>
  </div>
</template>

<script>
import SendFormComponent from './components/SendFormComponent'
import MessageComponent from './components/MessageComponent'
import { db, st, currentChatRoom, currentUser } from './firebase'

export default {
  name: 'chat-app',
  components: {
    SendFormComponent,
    MessageComponent
  },
  data () {
    return {
      limitTo: 5,
      messages: [],
      users: {},
      countOfMessages: 0
    }
  },
  computed: {
    messageGlobalArr: function() {
      let arr = [];
      for(let key in this.messages) {
        let obj = this.messages[key];
        obj.id = key;
        arr.push(obj);
      }
      return arr.reverse();
    }
  },
  created () {
    let _this = this;
    db.ref(currentChatRoom).child('messages').once('value', function(snap) {
      _this.countOfMessages = Object.keys(snap.val()).length;
    });
    db.ref('users').once('value').then(snapshot => {
      this.users = snapshot.val();
    });
    db.ref(currentChatRoom+'/messages').orderByChild('updateAt').limitToLast(this.limitTo).on('value', function(snapshot) {
      _this.messages = [];
      snapshot.forEach(function(child) {
        let obj = child.val();
        obj['id'] = child.key;
        _this.messages.unshift(obj);
      });
    });
  },
  methods: {
    loadMore(e) {
      let area = e.target;
      let areaInnerHeight = parseFloat(area.scrollHeight);
      let areaScrollTop = area.scrollTop + document.body.clientHeight;
      if(areaScrollTop == areaInnerHeight && this.limitTo <= this.countOfMessages) {
        let _this = this;
        db.ref(currentChatRoom+'/messages').off('value');
        this.limitTo += 5;
        db.ref(currentChatRoom+'/messages').orderByChild('updateAt').limitToLast(this.limitTo).on('value', function(snapshot) {
          _this.messages = [];
          snapshot.forEach(function(child) {
            let obj = child.val();
            obj['id'] = child.key;
            _this.messages.unshift(obj);
          });
        });
      }
    } 
  }
}
</script>

<style lang="scss">
  @import './assets/scss/fonts';
  @import './assets/scss/variables';
  @import './assets/scss/general';
  @import './assets/scss/chat-app';
  @import './assets/scss/adaptive';
  .toggle-btn {
    transition: all .3s ease-in-out;
  }
</style>
