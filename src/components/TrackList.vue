<template>
  <div class="track-id-container">
    <div v-for="trackId in trackIds" :key="trackId" class="track-id-button">
      <a @click="openTrack(trackId)" class="track-id-button-overlay" />
      <div class="track-id-button-inner">
        {{ trackId }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { useStore } from "@/store";
import { computed, defineComponent } from "vue";
export default defineComponent({
  setup(_, { emit }) {
    const store = useStore();

    const trackIds = computed(() =>
      Array.from(store.state.tracks.entries()).map(([id]) => id)
    );
    const openTrack = (id: string) => emit("open-track", id);

    return { trackIds, openTrack };
  },
});
</script>
<style lang="scss" scoped>
.track-id-container {
  padding: 8px;
}
.track-id-button {
  padding: 4px;
  position: relative;
  color: rgb(209, 209, 209);

  .track-id-button-overlay {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;

    &:hover {
      background: gray;
    }

    &:active {
      background: black;
    }
  }
  .track-id-button-inner {
    position: relative;
    pointer-events: none;
    z-index: 1;
  }
}
</style>
