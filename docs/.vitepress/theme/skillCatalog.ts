import type { AgentEntry, CapabilityDocument, RuleEntry, SkillEntry } from '../../../src/types/skills.ts'
import inventory from './data/skills/inventory.json' with { type: 'json' }
import personal from './data/skills/personal.json' with { type: 'json' }
import cloud from './data/skills/cloud.json' with { type: 'json' }
import plugins from './data/skills/plugins.json' with { type: 'json' }

export const skillCategories = [
    { id: 'getting-started', title: '使用与扩展 Codex' },
    { id: 'development', title: '开发与代码规范' },
    { id: 'testing', title: '排错、测试与审查' },
    { id: 'understanding', title: '项目理解与需求' },
    { id: 'ai-cloud', title: 'AI 应用与云部署' },
    { id: 'documents', title: '文档与内容创作' },
    { id: 'learning', title: '学习与知识整理' },
    { id: 'investment', title: '公司与投资研究' },
]

export const skillSnapshot = inventory
const descriptions = new Map([...personal, ...cloud, ...plugins].map(item => [item.id, item]))
export const skills: SkillEntry[] = inventory.entries.map(item => ({ ...item, ...descriptions.get(item.id)! }))

/** 个人技能保留原名，插件技能使用命名空间区分同名能力。 */
export function skillInvocation(skill: SkillEntry): string {
    return skill.kind === 'plugin' ? `${skill.source}:${skill.name}` : skill.name
}

/** 按任务分类、来源和全部关键词筛选，中文场景和英文调用名均可检索。 */
export function filterSkills(entries: SkillEntry[], query = '', category = '', source = ''): SkillEntry[] {
    const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
    return entries.filter(skill => {
        if (category && skill.category !== category) return false
        if (source && skill.source !== source) return false
        const text = [skillInvocation(skill), skill.title, skill.summary, ...skill.scenarios, skill.inputs, skill.output, skill.requirements].join(' ').toLocaleLowerCase()
        return words.every(word => text.includes(word))
    })
}

/** 博客当前尚未沉淀独立 Agent 与 Rule 条目；保留维度与类型，内容后续按能力手册模型补充。 */
export const agents: AgentEntry[] = []
export const rules: RuleEntry[] = []

/** 工具箱自身关联的说明文档，作为 overview「关联文档」统计来源。 */
export const toolboxDocuments: CapabilityDocument[] = [
    { path: '/skills/guide.md', title: '技能库使用指南' },
    { path: '/skills/connections.md', title: '插件与 MCP 使用指南' },
]

/** overview 四项统计：可复用 Skills、技能分类、专家 Agent、关联文档。 */
export const toolboxStats = {
    skills: skills.length,
    categories: skillCategories.length,
    agents: agents.length,
    documents: toolboxDocuments.length,
}

/** 技能分布：按分类聚合计数，供 overview 分布图与点击过滤使用。 */
export function skillDistribution(): { id: string; label: string; count: number }[] {
    return skillCategories.map(category => ({
        id: category.id,
        label: category.title,
        count: skills.filter(skill => skill.category === category.id).length,
    }))
}
