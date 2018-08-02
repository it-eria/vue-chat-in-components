<template>
  <div id="chat-app">
    <ChatComponent></ChatComponent>
  </div>
</template>

<script>
import ChatComponent from './components/ChatComponent';

export default {
  name: 'chat-app',
  components: {
    ChatComponent
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
