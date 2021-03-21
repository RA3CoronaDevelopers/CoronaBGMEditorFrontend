<template>
  <div>
    <button @click="loadXml">{{ t("loadXml") }}</button>
    <button @click="saveXml">{{ t("saveXml") }}</button>
    <button @click="togglePlay">{{ playText }}</button>
  </div>
</template>
<script lang="ts">
import { useI18n } from "vue-i18n";
import { computed, defineComponent, inject, ref } from "vue";
export default defineComponent({
  setup() {
    // IPC 连接
    const ws = inject("$connection");
    // 翻译
    const { t } = useI18n();

    // 加载 XML 文件
    const loadXml = async () => {
      const response: FileDialogResult = await ws.sendRequest({
        method: "OpenFileDialog",
        title: t("loadXml"),
        filters: t("xmlFilters"),
      });
      if (response.path) {
        ws.send({ method: "LoadXml", path: response.path });
      }
    };

    // 保存 XML 文件
    const saveXml = async () => {
      const response: FileDialogResult = await ws.sendRequest({
        method: "SaveFileDialog",
        title: t("saveXml"),
        filters: t("xmlFilters"),
      });
      if (response.path) {
        ws.send({ method: "SaveXml", path: response.path });
      }
    };

    // 播放以及暂停
    const playing = ref(false);
    const togglePlay = () => {
      ws.send({ propertyToBeSet: "Playing", value: !playing.value });
    }
    ws.useMessageHandler("type", "Playing", (m) => (playing.value = m.value));
    const playText = computed(() => t(playing.value ? "play" : "stop"));

    return {
      t,
      loadXml,
      saveXml,
      playing,
      togglePlay,
      playText,
    };
  },
});
</script>
<i18n>
{
  "zh": {
    "loadXml": "打开…",
    "saveXml": "保存",
    "xmlFilters": "XML 文件（*.xml）|*.xml|所有文件（*.*）|*.*",
    "play": "播放",
    "stop": "停止",
    "playSpeed": "播放速度",
  }
}
</i18n>