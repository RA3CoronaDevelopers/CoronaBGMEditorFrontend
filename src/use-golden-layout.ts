import { GoldenLayout, LayoutConfig } from 'golden-layout'
import { onMounted, ref } from 'vue'

const isClient = typeof window !== 'undefined'
const isDocumentReady = () => isClient && document.readyState === 'complete' && document.body != null

const useDocumentReady = (func: () => void) => {
  onMounted(() => {
    if (isDocumentReady()) {
      func()
    }
    else {
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
  createComponent: (type: string, container: HTMLElement) => void,
  destroyComponent: (container: HTMLElement) => void,
  config?: LayoutConfig
) => {
  const element = ref<HTMLElement | null>(null)
  const layout = ref<GoldenLayout | null>(null)
  const initialized = ref(false)

  useDocumentReady(() => {
    if (element.value == null) {
      throw new Error('Element must be set.')
    }
    const goldenLayout = new GoldenLayout(element.value)

    goldenLayout.getComponentEvent = (container, itemConfig) => {
      const { componentType } = itemConfig
      if (typeof componentType !== 'string') {
        throw new Error('Invalid component type.')
      }

      createComponent(componentType, container.element)
    }
    goldenLayout.releaseComponentEvent = container => {
      destroyComponent(container.element)
    }

    if (config != null) {
      goldenLayout.loadLayout(config)
    }

    // https://github.com/microsoft/TypeScript/issues/34933
    // eslint-disable-next-line
    layout.value = goldenLayout as any

    initialized.value = true
  })

  return { element, initialized, layout }
}