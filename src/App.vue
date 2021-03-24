<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld v-if="connected" msg="Welcome to Your Vue.js + TypeScript App" />
  <div v-else>Connecting to websocket...</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "./components/HelloWorld.vue";
import { useConnected } from "./ws-plugin";

export default defineComponent({
  name: "App",
  components: {
    HelloWorld,
  },
  setup: () => ({ connected: useConnected() }),
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
