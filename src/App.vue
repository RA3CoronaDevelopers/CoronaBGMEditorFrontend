<template>
  <editor v-if="connected"></editor>
  <div v-else>
    <img alt="Vue logo" src="./assets/logo.png" />
    <hello-world msg="Connecting to WebSocket..." />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Editor from "./components/Editor.vue";
import HelloWorld from "./components/HelloWorld.vue";
import { useConnected } from "./ws-plugin";

export default defineComponent({
  name: "App",
  components: {
    HelloWorld,
    Editor,
  },
  setup: () => ({ connected: useConnected() }),
});
</script>

<style lang="scss">
/** {
  background-color: #2c3e50;
  color: #eaeaea;
}*/

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background-color: #2c3e50;
  color: #eaeaea;
  padding-top: 60px;
}
</style>
