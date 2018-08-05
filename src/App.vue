<template>
  <div id="chat-app">
    <TaskComponent v-for="task in tasks" :key="task.id" :task="task" :user="user"></TaskComponent>
  </div>
</template>

<script>
import TaskComponent from './components/TaskComponent'
import { db, st } from './firebase'
import { currentChatRoom, currentUser } from './main'

export default {
  name: 'chat-app',
  components: {
    TaskComponent
  },
  data () {
    return {
      tasks: [],
      chat: currentChatRoom,
      user: currentUser
    }
  },
  created () {
    let _this = this;
    db.ref(this.chat).child('tasks').orderByChild('lastUpdate').on('value', function(snapshot) {
      _this.tasks = [];
      snapshot.forEach(function(child) {
        _this.tasks.unshift(
          {
            id: child.key, 
            lastUpdate: child.val().lastUpdate,
            name: child.val().name,
            messages: child.val().messages
          });
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
