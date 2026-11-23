import { onMounted, watch } from 'vue'

/** 将视图状态绑定到当前浏览记录；切换章节或前进后退时按记录恢复。 */
export function useToolboxHistory<State>(entryHash: string, snapshot: () => State, restore: (state: State) => void): void {
    onMounted(() => {
        const state: State | undefined = window.history.state?.toolboxView
        if (window.location.hash === entryHash && state) restore(state)
    })
    watch(snapshot, (state) => {
        if (window.location.hash !== entryHash) return
        window.history.replaceState({ ...window.history.state, toolboxView: state }, '')
    }, { flush: 'post' })
}
