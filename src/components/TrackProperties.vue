<template>
  <div>
    <h4>{{ t('trackId', { trackId: track.id }) }}</h4>
    <input type="text" v-model="musicId" />
  </div>
</template>
<script lang="ts">
import { useStore } from '@/store'
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  props: {
    track: {
      type: Object as () => Track,
      required: true,
    },
  },
  setup(props) {
    const store = useStore()
    const { t } = useI18n()

    const updateTrack = <K extends keyof Track>(key: K, value: Track[K]) => {
      const newTrack = { ...props.track, [key]: value }
      store.commit('updateTrack', newTrack)
    }

    const musicId = computed<string>({
      get: () => props.track.musicId,
      set: value => updateTrack('musicId', value),
    })

    return { musicId, t }
  },
})
</script>
<i18n>
{
  zh: {
    trackId: "轨道 ID：{trackId}",
    musicInfo: "音乐信息"
  }
  
}
</i18n>
