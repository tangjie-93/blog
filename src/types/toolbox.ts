export interface ToolboxEntry {
    id: string
    name: string
    kind: 'plugin' | 'mcp'
    summary: string
    scenarios: string[]
    requirements: string
    setup: string
    prompt: string
    status: string
    source: string
    skillCount?: number
}
