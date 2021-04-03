<template>
  <div
    class="timeline"
    :style="{ width }"
    :class="{ 'timeline-active': isActive }"
  >
    <template v-if="track">
      <div
        class="checkpoint"
        v-for="({ time, left }, i) in checkPoints"
        :key="i"
        :style="{ left }"
      >
        <div class="checkpoint-content">
          {{ time.toString() }}
        </div>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { TimeSpan } from "@/time-span";
import { useConnection } from "@/ws-plugin";
import { computed, defineComponent, reactive, ref, watchEffect } from "vue";

export default defineComponent({
  props: {
    scale: {
      type: Number,
      default: 1,
    },
    trackId: String,
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const ws = useConnection();

    let filter: string | undefined;
    const track = ref<Track | null>(null);
    ws.useMessageHandler("type", "Tracks", (tracks) => {
      const filtered = tracks.value.filter(({ id }) => id === filter);
      track.value = filtered.length > 0 ? reactive(filtered[0]) : null;
    });
    watchEffect(() => {
      filter = props.trackId;
      ws.sendRequest({ requestedProperty: "Tracks" });
    });

    const seconds = computed(
      () => new TimeSpan(track.value?.length.ticks ?? 0).totalSeconds
    );
    const width = computed(() => `${props.scale * seconds.value}px`);

    const checkPoints = computed(() =>
      (track.value?.checkPoints ?? []).map((c) => {
        const time = new TimeSpan(c.time.ticks);
        return {
          time,
          left: `${(time.totalSeconds * 100) / seconds.value}%`,
        };
      })
    );

    return { track, width, checkPoints };
  },
});
</script>
<style lang="scss" scoped>
.timeline {
  position: absolute;
  left: 0;
  height: 100%;

  .checkpoint {
    box-sizing: border-box;
    position: absolute;
    height: 100%;
    border-left: 1px solid lawngreen;
    .checkpoint-content {
      background: green;
    }
  }
}

.timeline-active {
  background: darkslategray;
}
</style>