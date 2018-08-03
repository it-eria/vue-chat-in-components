<template>
  <div class="b-chat__message">
    <div class="b-chat__message__user-avatar">
      <img src="../assets/img/avatar-1.jpg" alt="user avatar">
    </div>
    <div class="b-chat__message__inf-line">
      <h4>{{ user.name }}</h4>
      <span>{{ getDate(date.seconds) }}</span>
      <span>{{ getTime(date.seconds) }}</span>
    </div>
    <div class="b-chat__message__message-line">
      <p>{{ msg }}</p>
    </div>
    <!-- <div class="b-chat__message__files-line">
      <div class="non-photos">
        <a href="#" class="file-link file-link--video">
          <img src="../assets/img/video.svg" alt="video">
          <span>...wewqvideo-1.avi</span>
        </a>
        <a href="#" class="file-link file-link--document">
          <img src="../assets/img/document.svg" alt="document">
          <span>file-1.doc</span>
        </a>
        <a href="#" class="file-link file-link--archive">
          <img src="../assets/img/archive.svg" alt="archive">
          <span>archive-1.rar</span>
        </a>
      </div>
      <div class="photos">
        <a href="img/photo-1.jpg" target="_blank">
          <img src="../assets/img/photo-1.jpg" alt="photo">
        </a>
      </div>
    </div> -->
  </div>
</template>

<script>
import { db } from '../main'

export default {
  props: {
    message: Object
  },
  data () {
    return {
      user: '',
      date: this.message.createdAt,
      msg: this.message.msg
    }
  },
  firestore () {
    return {
      user: db.collection('users').doc(this.message.appendToUser)
    }
  },
  methods: {
    getDate (sec) {
      let temp_date = new Date(sec*1000);
      let year = temp_date.getFullYear();
      let temp_month = temp_date.getMonth();
      let temp_day = temp_date.getDate();
      let month = (+temp_month + 1 < 10) ? ('0' + (+temp_month + 1)) : (+temp_month + 1);
      let day = (+temp_day < 10) ? ('0' + temp_day) : temp_day;
      return year + '.' + month + '.' + day
    },
    getTime (sec) {
      let temp_date = new Date(sec*1000);
      let hour = temp_date.getHours();
      let temp_min = temp_date.getMinutes();
      let min = (+temp_min < 10) ? ('0' + temp_min) : temp_min;
      return hour + ':' + min
    }
  }
}
</script>

<style lang="scss">
  @import '../assets/scss/variables';
  @import '../assets/scss/send-form';
  @import '../assets/scss/b-message';
</style>
