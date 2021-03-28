<template>
  <div ref="element" class="editor-container">
    <teleport
      v-for="{ id, type, element } in componentInstances"
      :key="id"
      :to="element"
    >
      <component :is="type"></component>
    </teleport>
  </div>
</template>
<script lang="ts">
import { useGoldenLayout } from "@/use-golden-layout";
import { defineComponent, ref } from "vue";
import ToolBar from "./ToolBar.vue";
import TrackList from "./TrackList.vue";

const components = { ToolBar, TrackList };

export default defineComponent({
  components,
  setup() {
    interface ComponentInstance {
      id: number;
      type: string;
      element: HTMLElement;
    }
    let instanceId = 0;
    const componentTypes = new Set(Object.keys(components));
    const componentInstances = ref<ComponentInstance[]>([]);

    const createComponent = (type: string, element: HTMLElement) => {
      const component = componentTypes.has(type);
      if (component == null) {
        throw new Error(`Component not found: '${type}'`);
      }
      ++instanceId;
      componentInstances.value = componentInstances.value.concat({
        id: instanceId,
        type,
        element,
      });
    };
    const destroyComponent = (toBeRemoved: HTMLElement) => {
      componentInstances.value = componentInstances.value.filter(
        ({ element }) => element == toBeRemoved
      );
    };

    const { element } = useGoldenLayout(createComponent, destroyComponent, {
      root: {
        type: "column",
        content: [
          {
            type: "component",
            componentType: "ToolBar",
          },
          {
            type: "component",
            componentType: "TrackList",
          },
        ],
      },
    });

    return { element, componentInstances };
  },
});
</script>
<style lang="scss">
@import "~golden-layout/dist/css/goldenlayout-base.css";
@import "~golden-layout/dist/css/themes/goldenlayout-dark-theme.css";

.editor-container {
  width: 100%;
  height: 75vh;
}
</style>