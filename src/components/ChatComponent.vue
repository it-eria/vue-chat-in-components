<template>
  <!-- Chat -->
    <div class="b-chat">
      <div class="b-chat__aside"></div>
      <SendFormComponent></SendFormComponent>
      <MessageComponent v-for="(message, index ) in messages" :key="index"></MessageComponent>
    </div>
    <!-- /Chat -->
</template>

<script>
import SendFormComponent from './SendFormComponent';
import MessageComponent from './MessageComponent';

export default {
  components: {
    SendFormComponent,
    MessageComponent
  },
  data() {
    return {
      messages: [
        {

        },
        {

        }
      ]
    }
  }
}
</script>

<style lang="scss">
  @import '../assets/scss/variables';
  @import '../assets/scss/b-chat';
</style>


