<template>
  <div class="editor-container">
    <tool-bar class="editor-head"></tool-bar>
    <div ref="element" class="editor-body">
      <teleport
        v-for="{ id, type, element, props } in componentInstances"
        :key="id"
        :to="element"
      >
        <component :is="type" v-bind="props"></component>
      </teleport>
    </div>
  </div>
</template>
<script lang="ts">
import { useGoldenLayout } from '@/use-golden-layout'
import {
  ComponentItem,
  ContentItem,
  GoldenLayout,
  LayoutConfig,
  LayoutManager,
} from 'golden-layout'
import { defineComponent, onBeforeUnmount, shallowRef } from 'vue'
import Assets from './Assets.vue'
import Inspector from './Inspector.vue'
import TimeLine from './TimeLine.vue'
import TimeLineContainer from './TimeLineContainer.vue'
import ToolBar from './ToolBar.vue'
import TrackList from './TrackList.vue'
import { ExtractProp } from '@/utils'
import { useConnection } from '@/ws-plugin'
import { useStore } from '@/store'

const components = {
  Assets,
  Inspector,
  TimeLineContainer,
  TimeLine,
  ToolBar,
  TrackList,
}
type Components = typeof components

const initialLayout: LayoutConfig = {
  root: {
    type: 'row',
    content: [
      {
        type: 'column',
        content: [
          {
            type: 'row',
            content: [
              {
                type: 'component',
                componentType: 'TrackList',
                width: 35,
                componentState: {},
              },
              {
                type: 'component',
                componentType: 'TimeLineContainer',
                width: 65,
              },
            ],
            height: 70,
          },
          { type: 'component', componentType: 'Assets', height: 30 },
        ],
        width: 75,
      },
      { type: 'component', componentType: 'Inspector', width: 25 },
    ],
  },
}

export default defineComponent({
  components,
  setup() {
    // 获取数据
    const store = useStore()
    const connection = useConnection()
    connection.useMessageHandler('type', 'Tracks', tracks => {
      store.commit('setTracks', tracks.value)
    })
    connection.send({ requestedProperty: 'Tracks' })

    // 设置组件
    type ComponentData = {
      props?: object
    }

    interface ComponentInstance extends ComponentData {
      id: number
      type: string
      element: HTMLElement
    }
    let instanceId = 0
    const componentTypes = new Set(Object.keys(components))
    const componentInstances = shallowRef<ComponentInstance[]>([])

    const createComponent = (
      element: HTMLElement,
      type: string,
      data: unknown
    ) => {
      const component = componentTypes.has(type)
      if (component == null) {
        throw new Error(`Component not found: '${type}'`)
      }

      const { props }: ComponentData =
        data && typeof data === 'object' ? data : {}

      ++instanceId
      const componentInstance = {
        id: instanceId,
        type,
        element,
        props: { ...props },
      }
      componentInstances.value = componentInstances.value.concat(
        componentInstance
      )
      // TODO: 也许以后会有需要动态调整 prop 的情况，那样就得改成响应式了
      // 包括下面使用 ExtractProp<T> 的地方也得留意一下？可能实际上并不需要留意（
      return componentInstance
    }
    const destroyComponent = (toBeRemoved: HTMLElement) => {
      componentInstances.value = componentInstances.value.filter(
        ({ element }) => element !== toBeRemoved
      )
    }

    const { element, layout, traverseLayout } = useGoldenLayout(
      createComponent,
      destroyComponent,
      initialLayout
    )

    type Union = {
      [K in keyof Components]: {
        type: K
        props: ExtractProp<Components[K]>
      }
    }
    type UnionValues = Union[keyof Union]
    // 创建一个组件，并把它放到相同类型组件的旁边
    const createComponentItem = (data: UnionValues) => {
      const l = (layout.value as unknown) as GoldenLayout | null
      if (!l) {
        throw new Error(`Golden Layout is null`)
      }

      // 寻找相同类型组件
      let existingComponent: ComponentItem | undefined
      const candidates: ComponentItem[] = []
      traverseLayout(c => {
        if (ContentItem.isComponentItem(c) && c.componentType === data.type) {
          candidates.push(c)

          const getComponentProps = <T extends UnionValues>() => {
            return (c.component as { props?: Partial<T['props']> }).props
          }

          // 时间轴容器的特殊处理
          if (data.type === 'TimeLineContainer') {
            // 用现有时间轴的参数，以及新的时间轴的参数，进行比较……
            const existing = getComponentProps<typeof data>()
            const inputTracks = data.props.tracks
            // 假如要打开的轨道已经存在于现有的时间轴
            if (inputTracks.every(t => existing?.tracks?.includes(t))) {
              // 那么就直接使用现有的时间轴
              existingComponent = c
              return false
            }
          }
        }
        return true
      })
      // 假如找到完全符合的现有的组件，那么就不需要创建新组件了
      if (existingComponent) {
        // 直接把焦点设在现有的组件上即可
        existingComponent.focus()
        return
      }

      // 假如找到相同类型组件，把焦点设在找到的同类型组件上
      candidates[candidates.length - 1]?.focus()
      // 然后创建新组件，Golden Layout 将会尝试把组件创建在有焦点的组件旁边
      const locationSelector = LayoutManager.afterFocusedItemIfPossibleLocationSelectors.map(
        x => ({ ...x })
      )
      const newComponent = l.newComponentAtLocation(
        data.type,
        data,
        undefined,
        locationSelector
      )
      if (!newComponent) {
        throw new Error('Unexpected undefined new component')
      }
      // 把焦点设在新的组件上
      newComponent.focus()
      return newComponent
    }

    const unWatch = store.watch(
      t => t.lastActiveTrackId,
      t => t !== null && openTrack(t)
    )
    onBeforeUnmount(unWatch)

    const openTrack = (trackId: string) => {
      createComponentItem({
        type: 'TimeLineContainer',
        props: { tracks: [trackId] },
      })
    }

    return { element, componentInstances }
  },
})
</script>
<style>
@import '~golden-layout/dist/css/goldenlayout-base.css';
@import '~golden-layout/dist/css/themes/goldenlayout-dark-theme.css';
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
