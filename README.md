# 前端技术积累

基于 `VitePress` 的个人技术博客。文章源码沿用 `dev` 分支的 `docs/articles` 目录，分类、文件名和图片保持原有组织方式。

## 访问地址

- `GitHub Pages`：<https://tangjie-93.github.io/blog/>
- `Cloudflare Pages`：<https://tangjie-blog.pages.dev/>
- `Vercel` 生产：<https://blog-modawuw25-tangjie-93s-projects.vercel.app/>
- `Vercel` `dev` 预览：<https://blog-git-dev-tangjie-93s-projects.vercel.app/>

三平台的发布方法和分支规则见 [`DEPLOYMENT.md`](./DEPLOYMENT.md)。

## 1. 项目目录

```text
blog/
├── .github/
│   ├── workflows/deploy.yml       # 自动测试、构建和发布 GitHub Pages
│   └── ...                        # 贡献指南、Issue / PR 模板与提交规范
├── .node-version                  # 本地 Node.js 版本
├── docs/                          # 站点内容与 VitePress 配置
│   ├── .vitepress/
│   │   ├── config.mts             # 站点信息、导航、搜索、主题与部署基础路径
│   │   ├── navigation.mjs         # 根据文章目录生成分类导航和侧栏
│   │   ├── posts.data.ts          # 构建时加载文章元数据
│   │   └── theme/
│   │       ├── index.ts           # 主题入口、组件注册和全局样式引入
│   │       ├── style.css          # 全站配色、排版、布局和切换动画
│   │       ├── blog.ts            # 文章路径、元数据和筛选逻辑
│   │       ├── blog.test.ts       # 文章数据与评论相关测试
│   │       ├── comments.ts        # 评论隔离页面生成逻辑
│   │       ├── commentSettings.ts # 评论服务配置
│   │       └── components/
│   │           ├── HomePage.vue  # 首页布局、专题入口和最新文章
│   │           ├── HeroOrbit.vue # 首页轨道图形与动画
│   │           ├── BlogList.vue  # 文章卡片、筛选结果和分页
│   │           ├── Tags.vue      # 标签选择和文章筛选
│   │           └── Valine.vue    # 评论组件
│   ├── articles/                  # 按技术分类组织的 Markdown 文章
│   ├── images/                    # 文章配图，供 Markdown 相对路径引用
│   ├── public/                    # 直接复制到构建产物的静态资源
│   │   ├── image/logo.png         # 站点标志
│   │   ├── _headers               # Cloudflare Pages 响应头配置
│   │   └── _redirects             # Cloudflare Pages 旧地址重定向
│   ├── README.md                  # 站点首页，渲染 HomePage 组件
│   ├── timeline/README.md         # 文章归档页
│   ├── tags/README.md             # 标签页
│   ├── about/README.md            # 关于页
│   ├── summarize/README.md        # 充电站页面
│   └── comments/README.md         # 留言页
├── src/types/blog.ts              # 文章、组件参数和评论配置的类型定义
├── scripts/check-build.mjs        # 检查构建页面及本地链接、资源路径
├── tests/
│   ├── article-outline.test.mjs   # 文章标题与目录锚点检查
│   ├── comments.test.mjs          # 评论区高度变化和加载异常测试
│   ├── image-paths.test.mjs       # 图片引用与文件名大小写检查
│   ├── navigation.test.mjs        # 分类导航和文章地址测试
│   └── check-build.test.mjs       # 构建检查脚本及部署基础路径测试
├── package.json                   # 项目命令、依赖和包管理器版本
├── pnpm-lock.yaml                 # 固定依赖版本，保证安装一致
├── wrangler.toml                  # Cloudflare Pages 项目与输出目录配置
├── deploy.sh                      # 本地部署脚本入口
└── README.md                      # 项目说明，即本文档
```

常见修改位置：

- **写文章、改配图**：编辑 `docs/articles/` 和 `docs/images/`。
- **调整首页、列表和标签页**：编辑 `docs/.vitepress/theme/components/` 中的对应组件；全站样式放在 `docs/.vitepress/theme/style.css`。
- **调整导航、搜索和站点设置**：编辑 `docs/.vitepress/config.mts`；分类导航的生成逻辑在 `navigation.mjs`。
- **调整部署**：`GitHub Pages` 使用 `.github/workflows/deploy.yml`；`Cloudflare Pages` 使用 `wrangler.toml` 和 `package.json` 中的部署命令。

`node_modules/`、`docs/.vitepress/dist/`、`docs/.vitepress/cache/` 和 `.wrangler/` 为安装或运行时生成的目录，不属于文章源码，也不需要提交。根目录 `README.md` 用于介绍项目，`docs/README.md` 才是博客首页。

## 2. 本地运行

需要 `Node.js 22` 或更新版本，以及 `pnpm 10.28.2`（版本固定在 `package.json` 的 `packageManager` 中）。

```sh
pnpm install --frozen-lockfile
pnpm run docs:dev
```

构建、验证和预览：

```sh
pnpm test
pnpm run docs:build
pnpm run docs:preview
```

产物目录：`docs/.vitepress/dist`。`docs/**/README.md` 会生成对应目录的 `index.html`，其余文章继续生成同名 `.html` 文件。遍历算法的一篇文章原文件名末尾有空格，会导致预渲染失败，已去掉空格并为原 URL 添加永久重定向。

## 3. 发布到 `GitHub Pages`

完整的三平台发布说明见 [`DEPLOYMENT.md`](./DEPLOYMENT.md)。

`.github/workflows/deploy.yml` 在推送到 `dev` 时通过 `pnpm` 安装依赖、运行测试，验证根路径构建，再构建并发布 `GitHub Pages`。`PR` 只验证，不发布。

首次启用时，在仓库 [Pages 设置](https://github.com/tangjie-93/blog/settings/pages) 中，将 `Build and deployment → Source` 设置为 `GitHub Actions`，再把这些配置和 `pnpm-lock.yaml` 提交并推送到 `dev`。部署使用工作流自带的 `GITHUB_TOKEN`，无需额外保存部署令牌。

发布成功后的默认地址为 [博客首页](https://tangjie-93.github.io/blog/)。在 `Actions` 中打开 `Deploy VitePress to GitHub Pages` 查看发布结果。

工作流通过 `VITEPRESS_BASE=/blog/` 指定仓库子路径，本地开发和 `Cloudflare Pages` 默认使用 `/`。本地验证 `GitHub Pages` 产物：

```sh
VITEPRESS_BASE=/blog/ pnpm run docs:build
VITEPRESS_BASE=/blog/ pnpm run docs:preview
```

`Cloudflare` 的 `_redirects` 和 `_headers` 不会在 `GitHub Pages` 生效，旧带空格文章地址的永久重定向仍仅由 `Cloudflare` 提供。

## 4. 发布到 `Cloudflare Pages`

项目当前使用以下配置：

| 设置 | 值 |
| --- | --- |
| `Pages` 项目 | `tangjie-blog` |
| 生产分支 | `dev` |
| 生产地址 | `https://tangjie-blog.pages.dev` |
| 构建命令 | `pnpm run docs:build` |
| 输出目录 | `docs/.vitepress/dist` |
| `Node.js` 版本 | `22`，也可设置环境变量 `NODE_VERSION=22` |

### 4.1 通过 `GitHub` 自动发布

在 `Cloudflare` 控制台进入 `Workers & Pages`，创建 `Pages` 项目并连接 `tangjie-93/blog`，填写上表中的构建配置。之后推送到 `dev` 分支，`Pages` 会自动构建并发布。

`Cloudflare Pages` 仍由仓库集成独立发布；`GitHub Actions` 同时发布到 `GitHub Pages`。在 `Cloudflare` 的构建配置中将命令改为 `pnpm run docs:build`，并设置 `PNPM_VERSION=10.28.2`；不要在这里设置 `VITEPRESS_BASE=/blog/`。

### 4.2 使用 `Wrangler` 登录并确认账号

`Wrangler` 使用独立于 `Codex` 的 Cloudflare 登录凭据。先在项目目录执行：

```sh
pnpm exec wrangler login
pnpm exec wrangler whoami
```

`whoami` 输出的账号必须与 Cloudflare 控制台左上角当前选择的账号一致。若账号不对，先执行 `pnpm exec wrangler logout`，再重新登录。

### 4.3 查询或创建 `Pages` 项目

```sh
# 查看当前账号下的所有 Pages 项目
pnpm exec wrangler pages project list

# 仅在项目尚不存在时创建
pnpm exec wrangler pages project create tangjie-blog --production-branch dev
```

如果 `tangjie-blog` 已经存在，不要重复创建；先确认它属于此博客，再继续部署。项目名必须与 `wrangler.toml` 和 `package.json` 中的配置一致。

### 4.4 构建并上传

推荐使用项目脚本，它会先构建再上传：

```sh
pnpm run deploy
```

等价的分步命令如下：

```sh
pnpm run docs:build
pnpm exec wrangler pages deploy docs/.vitepress/dist --project-name tangjie-blog
```

需要明确指定分支时，在上传命令末尾增加 `--branch dev`。不要在未确认项目用途时覆盖已有站点。

### 4.5 查看部署记录和地址

```sh
# 查看最近的部署记录
pnpm exec wrangler pages deployment list --project-name tangjie-blog

# 查看最新生产部署
pnpm exec wrangler pages deployment list \
  --project-name tangjie-blog \
  --environment production
```

部署列表中的 `Deployment` 地址可用于预览，生产地址通常是 `https://tangjie-blog.pages.dev`。也可以在控制台进入 `Workers & Pages` → `tangjie-blog` → `Deployments` 查看构建详情。

### 4.6 本地预览和部署日志

先构建静态文件，再用 `Pages` 运行时预览：

```sh
pnpm run docs:build
pnpm exec wrangler pages dev docs/.vitepress/dist
```

如果项目包含 `Pages Functions`，可以实时查看某次部署的函数日志：

```sh
pnpm exec wrangler pages deployment tail <deployment-id> \
  --project-name tangjie-blog \
  --environment production
```

构建失败应优先查看控制台中该部署的 `Build log`；`Pages Functions` 的运行错误可通过上面的日志命令查看。

### 4.7 评论服务：Waline

评论使用 `Waline`，博客仍部署在 `Cloudflare Pages`，评论服务独立部署在 `Vercel`，数据存入 `Neon PostgreSQL`。现有 `<Valine/>` 标签保留为兼容入口，不需要批量修改文章。

部署步骤见 [Waline 官方入门](https://waline.js.org/en/guide/get-started/)。仓库内 `services/waline/` 是基于官方示例的独立服务，固定使用 `@waline/vercel 1.43.4`；部署目录为该子目录，不要把整个博客仓库作为评论服务部署。连接 `Neon` 后，在空数据库中执行官方 [waline.pgsql](https://github.com/walinejs/waline/blob/main/assets/waline.pgsql)，再重新部署服务。本仓库也保存了该官方脚本：`services/waline/schema.pgsql`。不要在已有数据的数据库中重复初始化。

在 `Waline` 服务端配置数据库凭据及以下变量（变量名参见 [官方配置](https://waline.js.org/en/reference/server/env.html)）：

| 变量 | 设置位置与用途 |
| --- | --- |
| `PG_HOST`、`PG_PORT`、`PG_DB`、`PG_USER`、`PG_PASSWORD`、`PG_SSL` | `Vercel` 环境变量；使用 `Neon` 提供的连接参数，端口通常为 `5432`，`PG_SSL=true`。如集成已注入对应的 `POSTGRES_*` 别名，请核对后复用，勿配置两套冲突值。 |
| `SITE_NAME`、`SITE_URL` | 博客名称及实际公开网址。 |
| `SERVER_URL` | 评论服务的固定公开地址。 |
| `SECURE_DOMAINS` | 允许的博客与评论服务域名，多个以逗号分隔；测试域名单独按需添加。 |
| `DISABLE_REGION` | 设为 `true`，不展示访客地区。 |

服务建好后，立即访问 `<serverURL>/ui/register`，由站长注册首个管理员，然后在 `<serverURL>/ui` 管理、回复和删除评论。完成管理员注册后再公开接入博客。

前端只需要公开的服务地址，不需要数据库密码或管理员密钥：

```sh
# 项目根目录；VitePress 配置从根目录加载此变量
cp .env.example .env.local
```

将 `.env.local` 中的 `VITE_WALINE_SERVER_URL` 改成真实服务地址，然后运行 `pnpm dev`。生产构建在 `Cloudflare Pages` 的构建环境中设置同名变量；使用本地 `pnpm run deploy` 时，先确认本地变量正确。修改后必须重新构建。地址为空时页面显示评论暂不可用，不会回退到 `LeanCloud`。

邮件由 `Waline` 服务端发送。按[通知文档](https://waline.js.org/guide/features/notification.html)设置 `SMTP_HOST`、`SMTP_PORT`、`SMTP_SECURE`、`SMTP_USER`、`SMTP_PASS`、`SENDER_EMAIL` 和 `AUTHOR_EMAIL`；邮箱授权码只保存在 `Vercel`。接入后验证新留言通知与回复通知。旧 `/api/comment-notify` 已移除，旧的 `Cloudflare` 邮件密钥在确认切换成功后可从控制台删除。

#### 历史评论迁移与上线

1. 在 `LeanCloud` 到期前导出 `Comment` 和阅读量 `Counter`，保留原始备份。导出文件可能含邮箱等私人数据，不要提交到仓库或放入 `docs/public/`。
2. 通过 [Waline 官方迁移工具](https://waline.js.org/en/migration/tool.html)转换至目标存储格式；先在测试数据库导入并核对评论数量、昵称、时间和回复关系。阅读量是否能转换需单独核对，不能假定评论迁移会同步阅读量。
3. 保留原评论 `url`，例如留言板为 `/blog/comments/`；前端继续使用这些历史标识，即使公开站点已不带 `/blog/` 前缀。
4. 在 `dev` 验证留言、回复、后台删除、邮件、明暗主题和文章跳转。若暂时无法导出旧数据，先保留旧服务，不宣称历史迁移完成。
5. 正式切换前暂停旧服务写入并导出最后一份数据，避免漏掉迁移期间的新留言。验收后正常合并 `dev` 到 `master` 并部署，不强制重写发布分支。失败时恢复旧版本，并保留新旧两端的数据备份。

### 4.8 常见问题

- **控制台显示 `No projects found`**：检查左上角账号，再运行 `pnpm exec wrangler whoami` 和 `pnpm exec wrangler pages project list`；两边账号必须一致。
- **部署成功但页面没有更新**：先运行 `pnpm exec wrangler pages deployment list --project-name tangjie-blog`，确认最新部署的分支和状态，再检查浏览器缓存。
- **构建失败**：确认使用 `Node.js 22`，并检查输出目录 `docs/.vitepress/dist` 是否生成。
- **同名项目无法创建**：项目已经存在时直接运行 `pnpm run deploy`，不要再次执行 `pages project create`。

旧 `/blog/` 前缀通过 `docs/public/_redirects` 重定向至新站根路径。`Cloudflare Pages` 会把 `.html` 请求规范化为无扩展名 URL，物理页面和文章内容仍保留。原域名切换需要另行绑定自定义域名和配置 `DNS`；新站重定向不能改变旧域名的响应。

## 5. 继续写文章

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

搜索由 `VitePress` 在本地生成索引，不需要第三方搜索账号。评论使用 `Waline`，继续按原 `/blog/` 路径关联记录；服务端部署和历史数据迁移参见上文。评论在隔离页面内按需加载。

## 6. 官方参考

[VitePress 部署](https://vitepress.dev/guide/deploy)、[Cloudflare Pages 的 VitePress 指南](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vitepress-site/)。
