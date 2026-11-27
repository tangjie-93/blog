// 只处理文件开头的 YAML 头部，不触碰正文、换行或其余字段。
export function splitArticleFrontmatter(source) {
  const match = /^(﻿?---[\t ]*(\r?\n))([\s\S]*?)(^---[\t ]*(?:\r?\n|$))/m.exec(source)
  if (!match || match.index !== 0) return undefined
  const [, opening, newline, fields, closing] = match
  return { opening, newline, fields, closing, body: source.slice(match[0].length) }
}

export function withoutArticleDateFields(source) {
  const header = splitArticleFrontmatter(source)
  if (!header) return source
  const pattern = /^(date|updated):[\t ]*(?:'[^'\r\n]+'|"[^"\r\n]+"|\d{4}-\d{1,2}-\d{1,2}(?:[T ][0-9:.Z+-]+)?)[\t ]*(?:#[^\r\n]*)?(?:\r?\n|$)/gm
  const keys = [...header.fields.matchAll(/^(date|updated):/gm)]
  const matches = [...header.fields.matchAll(pattern)]
  if (keys.length !== matches.length || new Set(keys.map(match => match[1])).size !== keys.length) return source
  const fields = header.fields.replace(pattern, '')
  if (fields || !matches.length) return header.opening + fields + header.closing + header.body
  // 新增只有日期的 YAML 头部时，允许带一个分隔正文的空行。
  return header.opening.slice(0, header.opening.indexOf('---')) + header.body.replace(/^\r?\n/, '')
}
