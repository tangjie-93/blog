import { computed, nextTick, onBeforeUnmount, onMounted, ref, toValue, watch, type CSSProperties, type MaybeRefOrGetter, type Ref } from 'vue'
import { fitPageSize } from './pageFit.ts'

interface FitPageSizeOptions {
    enabled: boolean
    fallbackSize: number
    minCardWidth: MaybeRefOrGetter<number>
    minCardHeight: MaybeRefOrGetter<number>
    maxCardHeight?: MaybeRefOrGetter<number>
    maxColumns?: number
    maxRows?: MaybeRefOrGetter<number>
    /** 小于该宽度时退回固定分页并允许页面滚动，窄屏一屏放不下几项。 */
    minViewportWidth?: number
    /** 小于该高度时退回固定分页，避免压缩卡片。 */
    minViewportHeight?: number
    /** 位于测量区内、需要预留空间的分页栏。 */
    footer?: Ref<HTMLElement | null>
}

/**
 * 让列表按所在视口容量分页：服务端先用固定数量渲染，挂载后测量可用空间，
 * 之后跟随窗口尺寸更新列数、行数与每页数量。
 */
export function useFitPageSize(viewport: Ref<HTMLElement | null>, options: FitPageSizeOptions) {
    const pageSize = ref(options.fallbackSize)
    const columns = ref(0)
    const rowHeight = ref(0)
    const active = ref(false)
    let observer: ResizeObserver | undefined
    let media: MediaQueryList | undefined

    const gridStyle = computed<CSSProperties | undefined>(() => {
        if (!columns.value || !rowHeight.value) return undefined
        return {
            gridTemplateColumns: `repeat(${columns.value}, minmax(0, 1fr))`,
            gridAutoRows: `minmax(0, ${rowHeight.value}px)`
        }
    })

    function measure(): void {
        const element = viewport.value
        if (!active.value || !element) return
        // 视口本身只负责占位，间距定义在它内部的网格容器上（视口读到的 gap 是 normal）。
        const styleOwner = element.firstElementChild instanceof HTMLElement ? element.firstElementChild : element
        const { columnGap, rowGap } = getComputedStyle(styleOwner)
        const gapX = Number.parseFloat(columnGap) || 0
        const gapY = Number.parseFloat(rowGap) || gapX
        const fit = fitPageSize(
            element.clientWidth,
            element.clientHeight - (options.footer?.value?.offsetHeight ?? 0),
            toValue(options.minCardWidth),
            toValue(options.minCardHeight),
            gapX,
            gapY,
            toValue(options.maxCardHeight),
            options.maxColumns,
            toValue(options.maxRows)
        )
        columns.value = fit.columns
        rowHeight.value = fit.rowHeight
        pageSize.value = fit.pageSize
    }

    /** 跨过视口断点时切换模式；退出整屏时恢复固定分页和默认网格。 */
    function syncActive(): void {
        active.value = options.enabled && (!media || media.matches)
        if (!active.value) {
            columns.value = 0
            rowHeight.value = 0
            pageSize.value = options.fallbackSize
            return
        }
        measure()
    }

    onMounted(() => {
        if (!options.enabled || typeof ResizeObserver === 'undefined') return
        const conditions = [
            options.minViewportWidth && `(min-width: ${options.minViewportWidth}px)`,
            options.minViewportHeight && `(min-height: ${options.minViewportHeight}px)`
        ].filter(Boolean)
        if (conditions.length) {
            media = window.matchMedia(conditions.join(' and '))
            media.addEventListener('change', syncActive)
        }
        observer = new ResizeObserver(() => { measure() })
        if (viewport.value) observer.observe(viewport.value)
        if (options.footer?.value) observer.observe(options.footer.value, { box: 'border-box' })
        syncActive()
    })

    watch(() => [toValue(options.minCardWidth), toValue(options.minCardHeight), toValue(options.maxCardHeight), toValue(options.maxRows)], async () => {
        await nextTick()
        measure()
    })

    onBeforeUnmount(() => {
        observer?.disconnect()
        media?.removeEventListener('change', syncActive)
    })

    return { pageSize, columns, rowHeight, active, gridStyle, measure }
}
