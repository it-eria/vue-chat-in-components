<template>
  <div class="b-chat__message">
    <div class="b-chat__message__user-avatar">
      <img src="../assets/img/avatar-1.jpg" alt="user avatar">
    </div>
    <div class="b-chat__message__inf-line">
      <h4>Veronica Gromadska</h4>
      <span>2018.07.13</span>
      <span>9:50 pm</span>
    </div>
    <div class="b-chat__message__message-line">
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillu</p>
    </div>
    <div class="b-chat__message__files-line">
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
    </div>
  </div>
</template>

<script>
export default {
  
}
</script>

<style lang="scss">
  @import '../assets/scss/variables';
  @import '../assets/scss/b-message';
</style>


