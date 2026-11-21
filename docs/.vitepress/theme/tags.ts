import type { BlogPost } from '../../../src/types/blog.ts'

const aliases: Record<string, string> = {
    js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript',
    vue: 'Vue', vuejs: 'Vue', vue3: 'Vue 3', 'vue.js': 'Vue', 'vue 3': 'Vue 3',
    react: 'React', css: 'CSS', es6: 'ES6', threejs: 'Three.js', 'three.js': 'Three.js',
    node: 'Node.js', nodejs: 'Node.js', 'node.js': 'Node.js', http: 'HTTP', jquery: 'jQuery',
    webgl: 'WebGL', canvas: 'Canvas', webpack: 'webpack', linux: 'Linux', docker: 'Docker',
    git: 'Git', nginx: 'Nginx', python: 'Python', java: 'Java',
    agent: 'Agent', 'ai agent': 'Agent', 'ai agents': 'Agent', ai: 'AI', llm: 'LLM',
    rag: 'RAG', embedding: 'Embedding', mcp: 'MCP', skill: 'Skills', skills: 'Skills',
    plugin: '插件', prompt: '提示词', harness: 'Harness',
    github: '开源生态', '开源项目': '开源生态', '开源': '开源生态',
    '学习路线': '学习资料', '资源导航': '学习资料', '术语': '学习资料', '发音': '学习资料',
    '项目实战': '工程实践', '实战': '工程实践', '实验': '工程实践',
    '数据': '数据工程', '向量数据库': '向量检索', '检索': '向量检索', '重排': '向量检索',
    '知识库': 'RAG', '引用': 'RAG', '切分': '数据工程',
    '注意力': 'Transformer', '对齐': '模型训练', '预训练': '模型训练', '训练': '模型训练',
    '推理': '模型推理', '生成模型': '多模态', '排障': '故障排查', '架构选型': '架构',
}
const genericTags = new Set(['基础', '入门', '高级', '生产', '技术', 'Web'])

/** 统一站点显示与筛选语义；只处理明确别名，未登记的专业词保留。 */
export function normalizeTag(value: string): string {
    const cleaned = value.trim().replace(/\s+/g, ' ')
    return genericTags.has(cleaned) ? '' : aliases[cleaned.toLowerCase()] ?? cleaned
}
export function normalizeTags(values: unknown[]): string[] {
    return [...new Set(values.map(value => normalizeTag(String(value))).filter(Boolean))]
}

export const tagGroups = [
    { id: 'frontend', label: '前端与图形', description: '语言、框架与浏览器图形', tags: ['JavaScript', 'TypeScript', 'ES6', 'CSS', 'Vue', 'Vue 3', 'React', 'jQuery', 'WebGL', 'Three.js', 'Canvas', 'webpack'] },
    { id: 'ai', label: 'AI 与智能应用', description: '模型原理、检索与智能体', tags: ['AI', 'LLM', 'Agent', 'AI Coding', 'RAG', 'Embedding', '向量检索', '数据工程', 'LangChain', 'LangGraph', 'LangSmith', 'MCP', 'Skills', '插件', 'Harness', '提示词', 'Transformer', '模型训练', '模型推理', '机器学习', '深度学习', '多模态', '知识图谱', '评估', 'OpenAI', 'WeKnora', 'Jev'] },
    { id: 'backend', label: '后端与数据', description: '服务开发、持久化与数据协议', tags: ['Python', 'Java', 'Node.js', 'Spring', 'Spring Boot', 'JVM', 'Maven', '数据库', 'PostgreSQL', 'Redis', '微服务', 'Protobuf'] },
    { id: 'engineering', label: '工程与系统', description: '网络、部署与运行保障', tags: ['HTTP', 'Linux', 'Docker', 'Git', 'Nginx', '部署', '运维', '性能优化', '故障排查', '安全', '架构'] },
    { id: 'foundations', label: '算法与基础', description: '通用原理与思考工具', tags: ['算法', '数学', '正则表达式'] },
    { id: 'practice', label: '实践与资料', description: '源码、项目与学习参考', tags: ['源码', '工程实践', '开源生态', '学习资料'] },
] as const
export interface TagEntry { name: string; count: number }

/** 目录入口不重复计入文章数，每篇文章的同义标签仅计一次。 */
export function createTagCatalog(posts: BlogPost[]) {
    const counts = new Map<string, number>()
    const seen = new Set<string>()
    for (const post of posts) {
        if (seen.has(post.url) || /\/$|\/(?:README|index)\.html$/.test(post.url)) continue
        seen.add(post.url)
        for (const tag of normalizeTags(post.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
    const entries: TagEntry[] = [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'))
    const assigned = new Set(tagGroups.flatMap(group => [...group.tags]) as string[])
    const groups = tagGroups.map(group => ({ ...group, entries: entries.filter(entry => (group.tags as readonly string[]).includes(entry.name)) })).filter(group => group.entries.length)
    const other = entries.filter(entry => !assigned.has(entry.name))
    return { entries, groups: [...groups, ...(other.length ? [{ id: 'other', label: '其他主题', description: '保留尚未归组的专业概念', tags: other.map(entry => entry.name), entries: other }] : [])] }
}
