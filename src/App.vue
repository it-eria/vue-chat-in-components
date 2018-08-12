<template>
  <div id="chat-app" v-if="(Object.keys(users).length > 0) && (Object.keys(messages).length > 0)">
    <SendFormComponent :general="true"></SendFormComponent>
    <transition-group name="flip-list" tag="div">
      <MessageComponent v-for="message in messageArr" :key="message.id" :message="message" :users="users" :index="message.id"></MessageComponent>
    </transition-group>
    <!-- <button @click.prevent="loadMore(lastKey)">Load more</button> -->
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
      lastKey: '',
      messages: {},
      users: {},
    }
  },
  computed: {
    messageArr: function() {
      let arr = [];
      for(let key in this.messages) {
        let obj = this.messages[key];
        obj.id = key;
        arr.push(obj);
      }
      return arr.reverse();
    }
  },
  beforeCreate () {
    let _this = this;
    db.ref('users').once('value').then(snapshot => {
      this.users = snapshot.val();
    });
    db.ref(currentChatRoom).child('messages').on('value', function(snapshot) {
      _this.messages = snapshot.val();
      _this.lastKey = Object.keys(snapshot.val())[Object.keys(snapshot.val()).length - 1];
    });
  },
  methods: {
    // loadMore(from) {
    //   let _this = this;
    //   db.ref(currentChatRoom).child('messages').startAt(from).on('value', function(snapshot) {
    //     _this.messages = snapshot.val();
    //     _this.lastKey = Object.keys(snapshot.val())[0];
    //   });
    // } 
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
