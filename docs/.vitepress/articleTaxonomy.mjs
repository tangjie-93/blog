/** 导航、文章浏览和源文件归组共用的数据；不依赖 Node，可用于浏览器。 */
export const articleGroups = [
  { id: 'languages', directory: '语言与标准', text: '语言与标准', categories: ['javascript', 'es6', 'typescript', 'css', 'http'] },
  { id: 'engineering', directory: '框架与工程', text: '框架与工程', categories: ['vue', 'vue3', 'react', 'node', 'webpack', 'git'] },
  { id: 'ai', directory: '人工智能', text: 'AI', categories: ['ai', 'agent', 'agent-projects', 'rag', 'jev'], resources: [{ text: 'AI 工具箱', link: '/skills/', description: '查找 Skills、插件与工具' }] },
  { id: 'backend', directory: '后端', text: '后端', categories: ['python', 'java', 'linux', 'database', 'langchain'] },
  { id: 'graphics', directory: '图形与交互', text: '图形与交互', categories: ['webgl', 'threejs'] },
  { id: 'source', directory: '源码与算法', text: '源码与算法', categories: ['jquery-source-analysis', '算法'] },
  { id: 'indie', directory: '独立开发与出海', text: '独立开发与出海', categories: ['going-global'] },
]

export const categoryLabels = {
  ai: 'AI 基础', agent: 'Agent 架构', 'agent-projects': 'Agent 项目', jev: 'Jev 专题', 'going-global': '出海实战',
  css: 'CSS', es6: 'ES6', http: 'HTTP', javascript: 'JavaScript', java: 'Java', database: '数据库', langchain: 'LangChain',
  'jquery-source-analysis': 'jQuery 源码', linux: 'Linux', node: 'Node.js', git: 'Git', python: 'Python', rag: 'RAG',
  react: 'React', threejs: 'Three.js', typescript: 'TypeScript', vue: 'Vue', vue3: 'Vue 3', webgl: 'WebGL', webpack: 'Webpack',
}

export function postCategory(url) {
  const match = url.match(/^\/articles\/([^/]+)\//)
  return match ? decodeURIComponent(match[1]) : ''
}
