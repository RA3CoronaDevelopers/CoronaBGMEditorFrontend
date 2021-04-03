<template>
  <div class="editor-container">
    <tool-bar class="editor-head"></tool-bar>
    <div ref="element" class="editor-body">
      <teleport
        v-for="{ id, type, element, props, events } in componentInstances"
        :key="id"
        :to="element"
      >
        <component :is="type" v-bind="props" v-on="events"></component>
      </teleport>
    </div>
  </div>
</template>
<script lang="ts">
import { useGoldenLayout } from "@/use-golden-layout";
import {
  ComponentItem,
  ContentItem,
  GoldenLayout,
  LayoutConfig,
  LayoutManager,
} from "golden-layout";
import { defineComponent, shallowRef } from "vue";
import Assets from "./Assets.vue";
import Inspector from "./Inspector.vue";
import TimeLine from "./TimeLine.vue";
import TimeLineContainer from "./TimeLineContainer.vue";
import ToolBar from "./ToolBar.vue";
import TrackList from "./TrackList.vue";

const components = {
  Assets,
  Inspector,
  TimeLineContainer,
  TimeLine,
  ToolBar,
  TrackList,
};

const initialLayout: LayoutConfig = {
  root: {
    type: "row",
    content: [
      {
        type: "column",
        content: [
          {
            type: "row",
            content: [
              {
                type: "component",
                componentType: "TrackList",
                width: 35,
                componentState: {},
              },
              {
                type: "component",
                componentType: "TimeLineContainer",
                width: 65,
              },
            ],
            height: 70,
          },
          { type: "component", componentType: "Assets", height: 30 },
        ],
        width: 75,
      },
      { type: "component", componentType: "Inspector", width: 25 },
    ],
  },
};

export default defineComponent({
  components,
  setup() {
    interface ComponentInstance {
      id: number;
      type: string;
      element: HTMLElement;
      props?: object;
      events?: object;
    }
    let instanceId = 0;
    const componentTypes = new Set(Object.keys(components));
    const componentInstances = shallowRef<ComponentInstance[]>([]);

    const defaultProps = (type: string) => {
      return {};
    };
    const defaultEvents = (type: string) => {
      if (type === "TrackList") {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return { openTrack };
      }
      return {};
    };

    const createComponent = (
      element: HTMLElement,
      type: string,
      data: unknown
    ) => {
      const component = componentTypes.has(type);
      if (component == null) {
        throw new Error(`Component not found: '${type}'`);
      }
      type Data = {
        props?: object;
        events?: object;
      };
      const { props, events }: Data =
        data && typeof data === "object" ? data : {};

      ++instanceId;
      const componentInstance = {
        id: instanceId,
        type,
        element,
        props: { ...defaultProps(type), ...props },
        events: { ...defaultEvents(type), ...events },
      };
      componentInstances.value = componentInstances.value.concat(
        componentInstance
      );
      // TODO: 也许以后会有需要动态调整 prop 的情况，那样就得改成响应式了
      // 包括下面使用 ExtractProp<T> 的地方也得留意一下？可能实际上并不需要留意（
      return componentInstance;
    };
    const destroyComponent = (toBeRemoved: HTMLElement) => {
      componentInstances.value = componentInstances.value.filter(
        ({ element }) => element !== toBeRemoved
      );
    };

    const { element, layout, traverseLayout } = useGoldenLayout(
      createComponent,
      destroyComponent,
      initialLayout
    );

    // 创建一个组件，并把它放到相同类型组件的旁边
    const createComponentItem = (type: string, componentState?: {}) => {
      const l = (layout.value as unknown) as GoldenLayout | null;
      if (!l) {
        throw new Error(`Golden Layout is null`);
      }

      // 寻找相同类型组件
      const candidates: ComponentItem[] = [];
      traverseLayout((c) => {
        if (ContentItem.isComponentItem(c) && c.componentType === type) {
          candidates.push(c);
        }
        return true;
      });
      // 假如找到的话，把焦点设在找到的同类型组件上
      candidates[0]?.focus();
      // 然后创建新组件，Golden Layout 将会尝试把组件创建在有焦点的组件旁边
      const locationSelector = LayoutManager.afterFocusedItemIfPossibleLocationSelectors.map(
        (x) => ({ ...x })
      );
      l.newComponentAtLocation(
        type,
        componentState,
        undefined,
        locationSelector
      )?.focus();
    };

    const openTrack = (trackId: string) => {
      createComponentItem("TimeLineContainer", {
        props: { tracks: [trackId] },
      });
    };

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