export interface FitPageSize {
    columns: number
    rows: number
    pageSize: number
    rowHeight: number
}

/**
 * 按容器可用宽高计算一屏能完整展示的卡片网格。
 * 行高把剩余空间平摊给每一行，末页卡片不会因为数量少而被拉高。
 */
export function fitPageSize(
    width: number,
    height: number,
    minCardWidth: number,
    minCardHeight: number,
    gapX: number,
    gapY: number
): FitPageSize {
    const availableWidth = Math.max(0, width)
    const availableHeight = Math.max(0, height)
    const columnGap = Math.max(0, gapX)
    const rowGap = Math.max(0, gapY)
    const columns = Math.max(1, Math.floor((availableWidth + columnGap) / (Math.max(1, minCardWidth) + columnGap)))
    const rows = Math.max(1, Math.floor((availableHeight + rowGap) / (Math.max(1, minCardHeight) + rowGap)))
    const rowHeight = Math.max(0, Math.floor((availableHeight - (rows - 1) * rowGap) / rows))

    return { columns, rows, pageSize: columns * rows, rowHeight }
}
