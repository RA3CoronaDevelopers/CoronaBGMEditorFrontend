<template>
  <div class="timeline-container">
    <time-line v-for="trackId in tracks" :key="trackId" :trackId="trackId" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import TimeLine from './TimeLine.vue'

export default defineComponent({
  components: { TimeLine },
  props: {
    tracks: {
      type: Array as () => string[],
      default: []
    }
  },
})
</script>
<style lang="scss" scoped>
.timeline-container {
  overflow-x: auto;
  position: relative;
  width: 100%;
  height: 100%;
}
</style>