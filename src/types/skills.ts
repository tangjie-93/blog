/** 工具箱顶层资产类型：与「能力手册」的 Skill / Agent / Rule / MCP 对齐，插件为博客额外维度。 */
export type CapabilityKind = 'skill' | 'agent' | 'rule' | 'mcp' | 'plugin'

/** 资产挂载的说明文档（如 prompt.md、模板），对应能力手册的 documents 字段。 */
export interface CapabilityDocument {
    path: string
    title?: string
}

/** 一条可复用的场景示例：什么时候用、任务怎么写、怎么算完成。 */
export interface ScenarioExample {
    title: string
    when: string
    task: string
    outcome: string
    prompt?: string
}

export interface SkillEntry {
    id: string
    name: string
    source: string
    kind: string
    version: string
    status: string
    sourceHash: string
    title: string
    category: string
    summary: string
    scenarios: string[]
    inputs: string
    output: string
    prompt: string
    requirements: string
    /** 能力手册的场景化字段：按步骤、边界与示例组织，缺省时回退到上面的扁平字段。 */
    steps?: string[]
    boundary?: string
    examples?: ScenarioExample[]
    documents?: CapabilityDocument[]
}

/** 面向具体角色或任务的可迁移提示词（如「专利交底书专家」）。 */
export interface AgentEntry {
    id: string
    name: string
    title: string
    category: string
    summary: string
    prompt: string
    documents?: CapabilityDocument[]
    related?: string[]
}

/** 长期生效的团队边界与约定（如编码、提交、安全规范）。 */
export interface RuleEntry {
    id: string
    name: string
    title: string
    category: string
    summary: string
    prompt: string
    documents?: CapabilityDocument[]
}
