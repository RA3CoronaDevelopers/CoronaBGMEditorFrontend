import { ContentItem, GoldenLayout, LayoutConfig } from 'golden-layout'
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

const isClient = typeof window !== 'undefined'
const isDocumentReady = () =>
  isClient && document.readyState === 'complete' && document.body != null

const useDocumentReady = (func: () => void) => {
  onMounted(() => {
    if (isDocumentReady()) {
      func()
    } else {
      document.addEventListener(
        'readystatechange',
        () => isDocumentReady() && func(),
        {
          passive: true,
        }
      )
    }
  })
}

export const useGoldenLayout = (
  createComponent: (
    container: HTMLElement,
    type: string,
    data: unknown
  ) => void,
  destroyComponent: (container: HTMLElement) => void,
  config?: LayoutConfig
) => {
  const element = shallowRef<HTMLElement | null>(null)
  const layout = shallowRef<GoldenLayout | null>(null)
  const initialized = ref(false)

  useDocumentReady(() => {
    if (element.value == null) {
      throw new Error('Element must be set.')
    }
    const goldenLayout = new GoldenLayout(element.value)
    const updateSize = () => goldenLayout.updateRootSize()
    window.addEventListener('resize', updateSize)
    onBeforeUnmount(() => window.removeEventListener('resize', updateSize))

    goldenLayout.getComponentEvent = (container, itemConfig) => {
      const { componentType } = itemConfig
      if (typeof componentType !== 'string') {
        throw new Error('Invalid component type.')
      }
      return createComponent(
        container.element,
        componentType,
        itemConfig.componentState
      )
    }
    goldenLayout.releaseComponentEvent = container => {
      destroyComponent(container.element)
    }

    if (config != null) {
      goldenLayout.loadLayout(config)
    }

    // https://github.com/microsoft/TypeScript/issues/34933
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    layout.value = goldenLayout as any

    initialized.value = true
  })

  const traverseComponentTree = (
    visitor: (c: ContentItem) => boolean,
    root: ContentItem
  ) => {
    if (!visitor(root)) {
      return false
    }
    for (const child of root.contentItems) {
      if (!traverseComponentTree(visitor, child)) {
        return false
      }
    }
    return true
  }

  const traverseLayout = (visitor: (c: ContentItem) => boolean) => {
    const l = layout.value
    if (!l) {
      throw new Error(`Golden Layout is not initialized`)
    }
    if (!l.rootItem) {
      throw new Error(`Golden Layout does not have root`)
    }
    return traverseComponentTree(visitor, l.rootItem)
  }

  return { element, initialized, layout, traverseComponentTree, traverseLayout }
}
