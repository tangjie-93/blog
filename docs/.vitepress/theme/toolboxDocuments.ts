import type { SkillEntry } from '../../../src/types/skills'
import type { ToolboxEntry } from '../../../src/types/toolbox'
import { skillCategories, skillInvocation } from './skillCatalog.ts'

/** 技能包内的一份可查看、可导出的 Markdown 文档。 */
export interface SkillDocumentFile {
    /** 弹窗下拉框中展示的完整路径。 */
    path: string
    /** ZIP 内相对于技能目录的路径。 */
    relativePath: string
    content: string
}

/** 生成按场景使用的指令，供场景页和文档共用同一份文案。 */
export function skillScenarioPrompt(skill: SkillEntry, scenario: string): string {
    return [
        `请使用 ${skillInvocation(skill)}，完成这个任务：${scenario}`,
        '',
        '任务背景：【补充目标、读者与约束】',
        `准备材料：${skill.inputs}。实际材料：【填写或附上材料】`,
        `预期产物：${skill.output}`,
        `验收要求：${skill.requirements}`,
    ].join('\n')
}

/** 将已公开的技能用法、场景和提示词整理为 SKILL.md。 */
export function skillDocument(skill: SkillEntry): string {
    const steps = skill.steps?.length
        ? skill.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')
        : [
            `1. 明确目标，并准备以下材料：${skill.inputs}。`,
            `2. 使用 \`${skillInvocation(skill)}\` 执行任务，过程中保留可核对的依据。`,
            `3. 按验收要求检查结果：${skill.requirements}`,
        ].join('\n')
    return [
        `# ${skill.title}`,
        `> 调用名：\`${skillInvocation(skill)}\` · 分类：${categoryTitle(skill.category)} · 来源：${sourceTitle(skill.source)}`,
        '## 概述',
        skill.summary,
        '## 适用场景',
        skill.scenarios.map(scenario => `- ${scenario}`).join('\n'),
        '## 工作流程',
        steps,
        '## 输出结构',
        [
            `- 预期产物：${skill.output}`,
            `- 使用材料：${skill.inputs}`,
            `- 验收要点：${skill.requirements}`,
        ].join('\n'),
        '## 使用边界',
        skill.boundary || skill.requirements,
        '## 提示词',
        formatPrompt(skill.prompt),
        '本文为 AI 工具箱整理的公开使用说明。',
    ].join('\n\n') + '\n'
}

/** 生成技能包内的场景参考文档，列出每个场景的可复制指令。 */
export function skillScenariosDocument(skill: SkillEntry): string {
    const examples = skill.examples?.length
        ? skill.examples.map((example, index) => [
            `### ${index + 1}. ${example.title}`,
            example.when ? `适用时机：${example.when}` : '',
            `预期产物：${example.outcome}`,
            formatPrompt(example.prompt || example.task),
        ].filter(Boolean).join('\n\n'))
        : skill.scenarios.map((scenario, index) => [
            `### ${index + 1}. ${scenario}`,
            formatPrompt(skillScenarioPrompt(skill, scenario)),
        ].join('\n\n'))
    return [
        `# ${skill.title} · 场景参考`,
        '从下面的场景中选择最接近的一项，复制指令后替换【】中的内容。',
        '## 场景目录',
        (skill.examples?.length ? skill.examples.map(example => example.title) : skill.scenarios)
            .map((title, index) => `${index + 1}. ${title}`).join('\n'),
        '## 场景指令',
        examples.join('\n\n'),
    ].join('\n\n') + '\n'
}

/** 一个技能包包含主文档和场景参考，供预览、复制与 ZIP 下载共用。 */
export function skillDocumentFiles(skill: SkillEntry): SkillDocumentFile[] {
    const base = `skills/${skill.category}/${skillSlug(skill)}`
    return [
        { path: `${base}/SKILL.md`, relativePath: 'SKILL.md', content: skillDocument(skill) },
        { path: `${base}/references/scenarios.md`, relativePath: 'references/scenarios.md', content: skillScenariosDocument(skill) },
    ]
}

/** 主文档路径，用于在场景页说明需要拖入或安装的文件。 */
export function skillDocumentPath(skill: SkillEntry): string {
    return skillDocumentFiles(skill)[0].path
}

/** 技能目录名：保留字母、数字和连字符，避免导出路径包含特殊字符。 */
export function skillSlug(skill: SkillEntry): string {
    return (skill.name || skill.id.split(':').pop() || 'skill').replace(/[^a-zA-Z0-9._-]/g, '-')
}

/** 将已公开的插件或 MCP 配置说明整理为 Markdown。 */
export function toolDocument(entry: ToolboxEntry): string {
    return [
        `# ${entry.name}`, entry.summary, `状态：${entry.status}`,
        '## 适用场景', entry.scenarios.map(scenario => `- ${scenario}`).join('\n'),
        '## 使用前提', entry.requirements, '## 配置方式', entry.setup,
        '## 提示词', formatPrompt(entry.prompt),
        '本文为 AI 工具箱整理的公开使用说明。',
    ].join('\n\n') + '\n'
}

/** 选择比提示词中连续反引号更长的围栏。 */
function formatPrompt(prompt: string): string {
    const fenceLength = Math.max(2, ...Array.from(prompt.matchAll(/`+/g), match => match[0].length)) + 1
    const fence = '`'.repeat(fenceLength)
    return `${fence}text\n${prompt}\n${fence}`
}

function categoryTitle(id: string): string {
    return skillCategories.find(category => category.id === id)?.title || id
}

function sourceTitle(source: string): string {
    if (source === 'personal') return '个人技能'
    if (source === 'system') return '系统技能'
    return `${source} 插件`
}

/** 下载当前预览的文本，浏览器开始处理后释放文件 URL。 */
export function downloadToolboxDocument(id: string, markdown: string): void {
    downloadBlob(`${id.replace(/[^a-zA-Z0-9._-]/g, '-')}-guide.md`, new Blob([markdown], { type: 'text/markdown;charset=utf-8' }))
}

/** 下载当前技能包，ZIP 内保留技能目录、SKILL.md 与 references。 */
export function downloadSkillArchive(skill: SkillEntry): void {
    const folder = skillSlug(skill)
    const files = skillDocumentFiles(skill).map(file => ({ path: `${folder}/${file.relativePath}`, content: file.content }))
    downloadBlob(`${folder}-skill.zip`, new Blob([createZipBytes(files)], { type: 'application/zip' }))
}

function downloadBlob(filename: string, blob: Blob): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 只在本地生成、不含压缩的 ZIP，避免为一次性下载引入依赖。 */
export function createZipBytes(files: { path: string; content: string }[]): Uint8Array {
    const encoder = new TextEncoder()
    const table = crcTable()
    const { time, date } = dosTimestamp(new Date())
    const localParts: Uint8Array[] = []
    const centralParts: Uint8Array[] = []
    let offset = 0

    for (const file of files) {
        const name = encoder.encode(safeArchivePath(file.path))
        const data = encoder.encode(file.content)
        const crc = crc32(data, table)
        const local = new Uint8Array(30 + name.length)
        const localView = new DataView(local.buffer)
        localView.setUint32(0, 0x04034b50, true)
        localView.setUint16(4, 20, true)
        localView.setUint16(6, 0x0800, true)
        localView.setUint16(8, 0, true)
        localView.setUint16(10, time, true)
        localView.setUint16(12, date, true)
        localView.setUint32(14, crc, true)
        localView.setUint32(18, data.length, true)
        localView.setUint32(22, data.length, true)
        localView.setUint16(26, name.length, true)
        localView.setUint16(28, 0, true)
        local.set(name, 30)
        localParts.push(local, data)

        const central = new Uint8Array(46 + name.length)
        const centralView = new DataView(central.buffer)
        centralView.setUint32(0, 0x02014b50, true)
        centralView.setUint16(4, 20, true)
        centralView.setUint16(6, 20, true)
        centralView.setUint16(8, 0x0800, true)
        centralView.setUint16(10, 0, true)
        centralView.setUint16(12, time, true)
        centralView.setUint16(14, date, true)
        centralView.setUint32(16, crc, true)
        centralView.setUint32(20, data.length, true)
        centralView.setUint32(24, data.length, true)
        centralView.setUint16(28, name.length, true)
        centralView.setUint16(30, 0, true)
        centralView.setUint16(32, 0, true)
        centralView.setUint16(34, 0, true)
        centralView.setUint16(36, 0, true)
        centralView.setUint32(38, 0, true)
        centralView.setUint32(42, offset, true)
        central.set(name, 46)
        centralParts.push(central)

        offset += local.length + data.length
    }

    const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0)
    const end = new Uint8Array(22)
    const endView = new DataView(end.buffer)
    endView.setUint32(0, 0x06054b50, true)
    endView.setUint16(8, files.length, true)
    endView.setUint16(10, files.length, true)
    endView.setUint32(12, centralSize, true)
    endView.setUint32(16, offset, true)
    return concat([...localParts, ...centralParts, end])
}

function safeArchivePath(path: string): string {
    return path.split('/').filter(part => part && part !== '.' && part !== '..').join('/')
}

function concat(parts: Uint8Array[]): Uint8Array {
    const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
    let offset = 0
    for (const part of parts) {
        result.set(part, offset)
        offset += part.length
    }
    return result
}

function dosTimestamp(value: Date): { time: number; date: number } {
    return {
        time: (value.getHours() << 11) | (value.getMinutes() << 5) | (value.getSeconds() >> 1),
        date: ((value.getFullYear() - 1980) << 9) | ((value.getMonth() + 1) << 5) | value.getDate(),
    }
}

let crcLookup: Uint32Array | undefined

function crcTable(): Uint32Array {
    if (crcLookup) return crcLookup
    crcLookup = new Uint32Array(256)
    for (let index = 0; index < 256; index += 1) {
        let value = index
        for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
        crcLookup[index] = value >>> 0
    }
    return crcLookup
}

function crc32(data: Uint8Array, table: Uint32Array): number {
    let crc = 0xffffffff
    for (const byte of data) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
    return (crc ^ 0xffffffff) >>> 0
}

/** 转义全部 HTML，再把有限的 Markdown 语法还原为标签。 */
export function renderMarkdown(markdown: string): string {
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n')
    const html: string[] = []
    let index = 0
    while (index < lines.length) {
        const line = lines[index]
        if (!line.trim()) {
            index += 1
            continue
        }
        const fence = line.match(/^(`{3,}|~{3,})\s*[a-zA-Z0-9_-]*\s*$/)
        if (fence) {
            const marker = fence[1][0]
            const length = fence[1].length
            const closing = new RegExp(`^${marker}{${length},}\\s*$`)
            const body: string[] = []
            index += 1
            while (index < lines.length && !closing.test(lines[index])) {
                body.push(lines[index])
                index += 1
            }
            if (index < lines.length) index += 1
            html.push(`<pre><code>${escapeHtml(body.join('\n'))}</code></pre>`)
            continue
        }
        const heading = line.match(/^(#{1,6})\s+(.*)$/)
        if (heading) {
            html.push(`<h${heading[1].length}>${renderInline(heading[2])}</h${heading[1].length}>`)
            index += 1
            continue
        }
        if (/^>\s?/.test(line)) {
            const quote: string[] = []
            while (index < lines.length && /^>\s?/.test(lines[index])) {
                quote.push(lines[index].replace(/^>\s?/, ''))
                index += 1
            }
            html.push(`<blockquote>${renderInline(quote.join(' '))}</blockquote>`)
            continue
        }
        if (/^\s*[-*+]\s+/.test(line)) {
            const items: string[] = []
            while (index < lines.length) {
                const item = lines[index].match(/^\s*[-*+]\s+(.*)$/)
                if (!item) break
                items.push(item[1])
                index += 1
            }
            html.push(`<ul>${items.map(item => `<li>${renderInline(item)}</li>`).join('')}</ul>`)
            continue
        }
        if (/^\s*\d+[.)]\s+/.test(line)) {
            const items: string[] = []
            while (index < lines.length) {
                const item = lines[index].match(/^\s*\d+[.)]\s+(.*)$/)
                if (!item) break
                items.push(item[1])
                index += 1
            }
            html.push(`<ol>${items.map(item => `<li>${renderInline(item)}</li>`).join('')}</ol>`)
            continue
        }
        if (/^\s*(?:---+|\*\*\*+|___+)\s*$/.test(line)) {
            html.push('<hr />')
            index += 1
            continue
        }
        const paragraph: string[] = []
        while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
            paragraph.push(lines[index].trim())
            index += 1
        }
        if (paragraph.length) html.push(`<p>${renderInline(paragraph.join(' '))}</p>`)
        else index += 1
    }
    return html.join('\n')
}

function isBlockStart(line: string): boolean {
    return /^(?:#{1,6}\s|`{3,}|~{3,}|>\s?|\s*[-*+]\s+|\s*\d+[.)]\s+|\s*(?:---+|\*\*\*+|___+)\s*$)/.test(line)
}

function renderInline(text: string): string {
    const codes: string[] = []
    let value = escapeHtml(text).replace(/`([^`]+)`/g, (_, code: string) => {
        codes.push(code)
        return `\u0000${codes.length - 1}\u0000`
    })
    value = value
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>')
    return value.replace(/\u0000(\d+)\u0000/g, (_, index: string) => `<code>${codes[Number(index)]}</code>`)
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}
