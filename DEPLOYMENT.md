# 发布指南

本项目可以同时发布到 `GitHub Pages`、`Cloudflare Pages` 和 `Vercel`。三个平台共用同一份源码，发布前都在本地使用 `pnpm` 构建和校验。

## 发布前检查

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build
```

构建产物位于 `docs/.vitepress/dist`。不要提交 `node_modules/`、`docs/.vitepress/dist/`、`docs/.vitepress/cache/` 或 `.vercel/`。

## 三个平台的分工

| 平台 | 用途 | 发布方式 | 典型地址 |
| --- | --- | --- | --- |
| `GitHub Pages` | 仓库的静态站点 | 推送 `dev`，由 GitHub Actions 发布 | `https://tangjie-93.github.io/blog/` |
| `Cloudflare Pages` | 根路径生产站点 | 连接 GitHub 自动发布，或使用 `wrangler` 手动发布 | `https://tangjie-blog.pages.dev/` |
| `Vercel` | 根路径生产站点和分支预览 | 连接 GitHub 自动发布，或使用 Vercel CLI | Vercel 项目中的域名 |

同一个提交可能同时触发三个平台的构建。`GitHub Pages` 必须保留 `/blog/` 基础路径；`Cloudflare Pages` 和 `Vercel` 使用 `/`。

## 当前访问地址

| 平台 | 生产地址 | `dev` 预览地址 |
| --- | --- | --- |
| `GitHub Pages` | [tangjie-93.github.io/blog](https://tangjie-93.github.io/blog/) | — |
| `Cloudflare Pages` | [tangjie-blog.pages.dev](https://tangjie-blog.pages.dev/) | 由 Cloudflare 部署记录生成 |
| `Vercel` | [blog-modawuw25-tangjie-93s-projects.vercel.app](https://blog-modawuw25-tangjie-93s-projects.vercel.app/) | [blog-git-dev-tangjie-93s-projects.vercel.app](https://blog-git-dev-tangjie-93s-projects.vercel.app/) |

`Vercel` 的生产地址来自当前生产部署；`dev` 地址是分支别名，会始终指向 `dev` 分支最新的预览部署。每次提交对应的临时预览地址会变化。`Cloudflare Pages` 的预览地址请在项目的 `Deployments` 页面查看。

## 发布到 GitHub Pages

### 首次配置

在仓库的 `Settings → Pages` 中，把 `Build and deployment → Source` 设置为 `GitHub Actions`。工作流文件是 `.github/workflows/deploy.yml`，不需要额外的部署令牌。

### 发布

```sh
git status
git add <文件>
git commit -m "feat: 更新文章"
git push origin dev
```

推送后打开仓库的 `Actions`，查看 `Deploy VitePress to GitHub Pages`。只有 `dev` 分支会发布，`pull request` 只执行测试和构建。

### 本地模拟 GitHub Pages

```sh
VITEPRESS_BASE=/blog/ pnpm run build
VITEPRESS_BASE=/blog/ pnpm run docs:preview
```

## 发布到 Cloudflare Pages

### 方式一：连接 GitHub 自动发布

在 Cloudflare 控制台进入 `Workers & Pages`，创建或打开 `tangjie-blog`，连接仓库 `tangjie-93/blog`，使用以下配置：

| 设置 | 值 |
| --- | --- |
| 生产分支 | `dev` |
| 构建命令 | `pnpm run docs:build` |
| 输出目录 | `docs/.vitepress/dist` |
| `Node.js` | `22` |
| `PNPM_VERSION` | `10.28.2` |

不要设置 `VITEPRESS_BASE=/blog/`。保存后，每次推送到 `dev` 都会自动发布。

### 方式二：使用 Wrangler 手动发布

首次使用先登录并确认账号：

```sh
pnpm exec wrangler login
pnpm exec wrangler whoami
```

确认 `tangjie-blog` 已存在；只有项目不存在时才创建：

```sh
pnpm exec wrangler pages project list
pnpm exec wrangler pages project create tangjie-blog --production-branch dev
```

构建并发布：

```sh
pnpm run deploy
```

`pnpm run deploy` 等价于：

```sh
pnpm run docs:build
pnpm exec wrangler pages deploy docs/.vitepress/dist --project-name tangjie-blog
```

查看部署记录：

```sh
pnpm exec wrangler pages deployment list --project-name tangjie-blog
```

## 发布到 Vercel

根目录的 `vercel.json` 已固定以下配置：

```json
{
  "framework": "vitepress",
  "buildCommand": "pnpm run build",
  "outputDirectory": "docs/.vitepress/dist"
}
```

### 方式一：连接 GitHub 自动发布

1. 在 Vercel 控制台导入 `tangjie-93/blog`。
2. `Framework Preset` 选择 `VitePress`，或直接使用仓库中的 `vercel.json`。
3. `Install Command` 使用 `pnpm install --frozen-lockfile`。
4. `Build Command` 使用 `pnpm run build`。
5. `Output Directory` 使用 `docs/.vitepress/dist`。
6. 将生产分支设置为 `main` 或 `dev`，与团队实际发布分支保持一致。

推送到生产分支会生成生产部署；推送到其他分支会生成预览部署。预览部署一般会有一个自动生成的 `vercel.app` 地址，也可以给 `dev` 分支绑定固定的自定义域名。

### 方式二：使用 Vercel CLI

首次使用：

```sh
pnpm add --global vercel
vercel login
vercel link
```

创建预览部署：

```sh
vercel
```

创建生产部署：

```sh
vercel --prod
```

查看部署状态：

```sh
vercel ls blog
vercel inspect <部署地址>
```

### 自定义域名

生产域名和 `dev` 预览域名都需要先在 Vercel 项目中添加，并在域名服务商处完成 `DNS` 验证。例如：

| 用途 | 域名 |
| --- | --- |
| 生产 | `blog.example.com` |
| `dev` 预览 | `dev-blog.example.com` |

域名不属于当前 Vercel 账号时，命令会返回 `403 Not authorized to use the domain`。这时先把域名添加到自己的 Vercel 团队，或确认域名的 `DNS` 管理权限。

## 推荐发布顺序

日常发布直接在干净的 `dev` 分支执行：

```sh
npm run deploy
```

这个命令会先推送 `dev` 触发 `GitHub Pages`，再构建并发布 `Cloudflare Pages`，最后发布 `Vercel` 生产环境。它会把同一个当前 commit 传给三个平台，因此站点页脚显示的 commit 可以用来核对版本。

如果只需要发布单个平台：

```sh
npm run deploy:github
npm run deploy:cloudflare
npm run deploy:vercel
```

`npm run deploy` 要求当前分支为 `dev`，且工作区没有未提交改动。先提交改动，再执行发布。

```text
本地修改
  ↓
pnpm test && pnpm run build
  ↓
git push origin dev
  ├─ GitHub Actions → GitHub Pages
  ├─ GitHub 集成 → Cloudflare Pages
  └─ GitHub 集成 → Vercel 预览部署
  ↓
合并到生产分支
  ├─ Cloudflare Pages 生产部署
  └─ Vercel 生产部署
```

如果只想手动发布某个平台，不需要改代码，直接使用对应平台的 CLI 命令即可。

## 常见问题

- **GitHub Pages 正常，其他平台路径错误**：确认只有 GitHub Pages 设置了 `VITEPRESS_BASE=/blog/`。
- **Cloudflare 找不到项目**：运行 `pnpm exec wrangler whoami`，确认登录账号和控制台账号一致。
- **Vercel 构建失败**：确认 `Node.js` 版本至少为 `22`，并且使用 `pnpm install --frozen-lockfile`。
- **Vercel 预览地址每次变化**：给目标分支绑定一个固定的自定义域名；自动生成的部署地址本来就是按部署生成的。
- **评论服务地址错误**：检查 `VITE_WALINE_SERVER_URL`，不要把数据库密码或管理员密钥放到前端环境变量中。
