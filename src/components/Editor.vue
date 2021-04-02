<template>
  <div class="editor-container">
    <tool-bar class="editor-head"></tool-bar>
    <div ref="element" class="editor-body">
      <teleport
        v-for="{ id, type, element } in componentInstances"
        :key="id"
        :to="element"
      >
        <component :is="type"></component>
      </teleport>
    </div>
  </div>
</template>
<script lang="ts">
import { useGoldenLayout } from "@/use-golden-layout";
import { defineComponent, shallowRef } from "vue";
import Assets from "./Assets.vue";
import Inspector from "./Inspector.vue";
import TimeLine from "./TimeLine.vue";
import ToolBar from "./ToolBar.vue";
import TrackList from "./TrackList.vue";

const components = { Assets, Inspector, TimeLine, ToolBar, TrackList };

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
    const componentInstances = shallowRef<ComponentInstance[]>([]);

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
        type: "row",
        content: [
          {
            type: "column",
            content: [
              { 
                type: "row",
                content: [
                  { type: "component", componentType: "TrackList", width: 35 },
                  { type: "component", componentType: "TimeLine", width: 65 },
                ],
                height: 70
              },
              { type: "component", componentType: "Assets", height: 30 }
            ],
            width: 75
          },
          { type: "component", componentType: "Inspector", width: 25 },
        ],
      },
    });

    return { element, componentInstances };
  },
});
</script>
<style>
@import "~golden-layout/dist/css/goldenlayout-base.css";
@import "~golden-layout/dist/css/themes/goldenlayout-dark-theme.css";
</style>
<style lang="scss" scoped>
.editor-container {
  display: flex;
  flex-flow: column;
  height: 100%;
  text-align: left;
}

.editor-head {
  flex: 0 1 auto;
}

.editor-body {
  flex: 1 1 auto;
}
</style>