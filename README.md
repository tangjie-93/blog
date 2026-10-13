# 前端技术积累

基于 `VitePress` 的个人技术博客。文章源码沿用 `dev` 分支的 `docs/articles` 目录，分类、文件名和图片保持原有组织方式。

## 本地运行

需要 `Node.js 22` 或更新版本。

```sh
npm ci
npm run docs:dev
```

构建、验证和预览：

```sh
npm test
npm run docs:build
npm run docs:preview
```

产物目录：`docs/.vitepress/dist`。`docs/**/README.md` 会生成对应目录的 `index.html`，其余文章继续生成同名 `.html` 文件。遍历算法的一篇文章原文件名末尾有空格，会导致预渲染失败，已去掉空格并为原 URL 添加永久重定向。

## 发布到 Cloudflare Pages

### 连接 GitHub，自动发布

在 `Cloudflare` 控制台选择 `Workers & Pages` → 创建 `Pages` 项目 → 连接 `tangjie-93/blog`，使用以下设置：

| 设置 | 值 |
| --- | --- |
| 生产分支 | `dev`（需先把迁移后的源码推送到此分支） |
| 根目录 | 仓库根目录 |
| 构建命令 | `npm run docs:build` |
| 输出目录 | `docs/.vitepress/dist` |
| Node 版本 | `22`，也可在环境变量中设置 `NODE_VERSION=22` |

`.github/workflows/deploy.yml` 现在只验证构建；部署由 `Pages` 的仓库集成执行，避免再触发旧阿里云同步。

### 从本地上传

```sh
npx wrangler login
npx wrangler pages project create tangjie-blog --production-branch dev
npm run deploy
```

如果同名项目已存在，先确认该项目属于此博客，再直接执行 `npm run deploy`。`wrangler.toml` 中的项目名需要与目标项目一致。

`Git` 集成与直接上传的项目创建方式需要事先选定；若计划以后由 `GitHub` 自动部署，推荐先从控制台创建 `Git` 集成项目，再按需用命令行上传。不要在已有站点未确认用途时覆盖它。

旧 `/blog/` 前缀通过 `docs/public/_redirects` 重定向至新站根路径。`Cloudflare Pages` 会把 `.html` 请求规范化为无扩展名 URL，物理页面和文章内容仍保留。原域名切换需要另行绑定自定义域名和配置 `DNS`；新站重定向不能改变旧域名的响应。

## 继续写文章

在 `docs/articles/<分类>/` 新增 `.md` 文件。分类导航、文章列表和标签在构建时自动更新。

```yaml
---
title: 文章标题
date: '2026-10-13'
type: 技术
tags: Vue|JavaScript
note: 一句话摘要
---
```

搜索由 `VitePress` 在本地生成索引，不需要第三方搜索账号。评论继续使用原 `Valine / LeanCloud` 服务，按原 `/blog/` 路径查询历史记录；上线新域名后需要在原服务的安全域名设置中允许新域名。评论在隔离页面内按需加载，避免旧 SDK 的全局事件影响站内导航。

官方参考：[VitePress 部署](https://vitepress.dev/guide/deploy)、[Cloudflare Pages 的 VitePress 指南](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vitepress-site/)。
