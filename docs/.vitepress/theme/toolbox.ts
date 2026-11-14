import type { ToolboxEntry } from '../../../src/types/toolbox.ts'
import plugins from './data/toolbox/plugins.json' with { type: 'json' }
import mcp from './data/toolbox/mcp.json' with { type: 'json' }

export const pluginEntries = plugins as ToolboxEntry[]
export const mcpEntries = mcp as ToolboxEntry[]

/** 按来源和任务关键词检索插件或 MCP，不读取浏览者的本机配置。 */
export function filterTools(entries: ToolboxEntry[], query = '', source = ''): ToolboxEntry[] {
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
    return entries.filter(entry => (!source || entry.source === source) && words.every(word =>
        [entry.name, entry.summary, ...entry.scenarios, entry.requirements, entry.setup, entry.source].join(' ').toLocaleLowerCase().includes(word)))
}
