<template>
  <div>
    <button @click="togglePlay">{{ playText }}</button>
  </div>
</template>
<script lang="ts">
import { useI18n } from 'vue-i18n';
import { computed, defineComponent, inject, onMounted, ref } from 'vue'
export default defineComponent({
  setup() {
    const ws = inject('$connection');
    const { t } = useI18n()

    const playing = ref(false)
    const togglePlay = () => {
      ws.send({
        propertyToBeSet: 'Playing',
        value: !playing.value
      })
    }
    ws.useMessageHandler('type', 'Playing', m => playing.value = m.value)
    const playText = computed(() => t(playing.value ? 'play' : 'stop'))
    
    return {
      playing,
      togglePlay,
      playText
    }
  }
})
</script>
<i18n>
{
  "zh": {
    "play": "播放",
    "stop": "停止"
  }
}
</i18n>