<template>
  <div id="chat-app">
    <SendFormComponent :general="true"></SendFormComponent>
    <transition-group name="flip-list" tag="div">
      <MessageComponent v-for="(message, idx) in messages" :key="idx" :message="message"></MessageComponent>
    </transition-group>
  </div>
</template>

<script>
import SendFormComponent from './components/SendFormComponent'
import MessageComponent from './components/MessageComponent'
import { db, st } from './firebase'
import { currentChatRoom, currentUser, usersList } from './main'

export default {
  name: 'chat-app',
  components: {
    SendFormComponent,
    MessageComponent
  },
  data () {
    return {
      messages: [],
      nextKey: '',
      usersList: []
    }
  },
  created () {
    let _this = this;

    // Get users data appended to current chat
    (function() {
      return new Promise ((resolve, reject) => {
        let usersArr = []
        db.ref(currentChatRoom).child('users').on('value', function(snapshot) {
          snapshot.forEach(function(child) {
            if(child.val()) {
              usersArr.push(child.key);
            }
          });
        });
        resolve(usersArr);
      }).then(usersArr => {
        let usersData = [];
        return new Promise.all(usersArr.map(function(id) {
          db.ref('users').child(id).once('value', function(snapshot) {
            usersData.push(snapshot.val())
          });
          return usersData;
        })).then(_this.usersList => { console.log(_this) })
      });
    })();

    let messagesRef = db.ref(currentChatRoom).child('messages');
    messagesRef.limitToLast(5).once('value', function(snapshot) {
      snapshot.forEach(function(child) {
        _this.messages.push(child.val());
        _this.nextKey = child.key;
      });
    });
  }
}
</script>

<style lang="scss">
  @import './assets/scss/fonts';
  @import './assets/scss/variables';
  @import './assets/scss/general';
  @import './assets/scss/chat-app';
  @import './assets/scss/adaptive';
</style>
