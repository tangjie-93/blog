import type { SkillEntry } from '../../../src/types/skills.ts'
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
