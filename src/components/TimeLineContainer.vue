<template>
  <div class="timeline-container">
    <time-line
      v-for="trackId in tracks"
      :key="trackId"
      :track-id="trackId"
      :is-active="activeTrackId === trackId"
      @click="activeTrackId = trackId"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from "vue";
import TimeLine from "./TimeLine.vue";

export default defineComponent({
  components: { TimeLine },
  props: {
    tracks: {
      type: Array as () => string[],
      default: [],
    },
  },
  setup() {
    const activeTrackId = ref<string | null>(null);
    return {
      activeTrackId,
    };
  },
});
</script>
<style lang="scss" scoped>
.timeline-container {
  overflow-x: auto;
  position: relative;
  width: 100%;
  height: 100%;
}
</style>