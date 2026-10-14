---
title: "uv 完全使用指南（详尽版）"
date: "2026-06-23"
type: "技术"
tags: "Python"
note: "从安装到项目、依赖、虚拟环境和脚本管理的 uv 使用指南。"
---

# uv 完全使用指南（详尽版）

> [uv](https://docs.astral.sh/uv/) 是由 Astral 团队（ruff 作者）用 Rust 重写的 Python 包管理器，替代 pip、pip-tools、virtualenv、poetry 等工具链。
> **前端类比**：uv ≈ pnpm + nvm + npm scripts 三合一

---

## 安装

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# 通过 Homebrew (macOS)
brew install uv

# 通过 pip（不推荐，但可用）
pip install uv

# 验证
uv --version
uv --help
```

---

## `uv init` - 项目初始化（详解）

初始化指的是在当前目录或新建目录创建一个 Python 项目骨架，包含 `pyproject.toml`、虚拟环境、`README.md` 等。

### 完整语法

```
uv init [OPTIONS] [PATH]
```

### 所有参数

| 参数/选项 | 说明 | 前端类比 |
|-----------|------|----------|
| `PATH` | 项目路径。**省略**则在当前目录初始化；**指定**则创建新目录 | `npm init` vs `mkdir && cd && npm init` |
| `--name` | 显式指定项目名（覆盖 PATH 自动推导的名称） | `package.json` 中的 `name` |
| `--app` | 创建**应用项目**（默认行为），生成带入口脚本的结构 | `npm init` + `src/index.ts` |
| `--lib` | 创建**库项目**（可被 pip 安装/发布的包），不生成入口脚本 | `npm init` 用于发布 npm 包 |
| `--package` | 同 `--lib` 的别名 | — |
| `--no-readme` | 不生成 README.md | — |
| `--no-workspace` | 不和已有的 workspace 关联 | — |
| `--python` / `-p` | 指定 Python 版本，如 `--python 3.12` | `nvm use 20` |
| `--no-pin-python` | 不创建 `.python-version` 文件 | — |
| `--vcs` | 版本控制系统，默认 `git`，可选 `none` | — |
| `--no-package` | 不创建包结构（纯脚本项目） | — |
| `--build-backend` | 指定构建后端：`hatchling`(默认) / `setuptools` / `flit-core` / `pdm-backend` | — |

### 三种项目类型对比

| | `uv init`（--app，默认） | `uv init --lib` | `uv init --no-package` |
|---|---|---|---|
| **用途** | 独立应用（FastAPI、脚本等） | 可发布的 Python 库/包 | 纯脚本/实验性项目 |
| **入口文件** | `hello.py` | 无（需手动创建） | 无 |
| **pyproject.toml** | 有 `[project.scripts]` | 有 `[build-system]` | 极简，无 `[build-system]` |
| **可 pip install** | 可以 | 可以 | 不可以 |
| **适用场景** | Web API、CLI 工具 | SDK、工具库 | jupyter notebook、临时实验 |

### init 生成的 `hello.py` 差异

**`uv init`（--app）生成：**
```python
def main():
    print("Hello from my-project!")


if __name__ == "__main__":
    main()
```
> 这是标准的应用入口脚本，可通过 `pyproject.toml` 中的 `[project.scripts]` 注册为 CLI 命令。

**`uv init --lib` 不生成 hello.py**，只生成基本目录：
```
my-lib/
├── src/
│   └── my_lib/
│       └── __init__.py       # 包初始化文件
├── pyproject.toml
├── README.md
└── .python-version
```

### init 生成的 `pyproject.toml` 对比

**`uv init my-app`（--app）生成：**
```toml
[project]
name = "my-app"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.12"
dependencies = []

# CLI 入口定义：终端输入 my-app 即运行 hello.py 的 main()
[project.scripts]
my-app = "hello:main"
```

**`uv init --lib my-lib` 生成：**
```toml
[project]
name = "my-lib"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.12"
dependencies = []

[build-system]
requires = ["hatchling>=1.0"]
build-backend = "hatchling.build"
```
> `--lib` 多了 `[build-system]` 块，用于构建和发布到 PyPI。

**`uv init --no-package my-scripts` 生成：**
```toml
[project]
name = "my-scripts"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.12"
dependencies = []
```
> 极简版本，无 `[project.scripts]` 也无 `[build-system]`。

### init 常见用法组合

```bash
# 1. 新建 FastAPI 应用（最常用）
uv init my-api
# → app 模式，生成 hello.py + pyproject.toml + .venv

# 2. 在当前目录初始化已有项目
cd my-existing-project
uv init
# → 非空目录也可初始化，uv 会智能跳过已有文件

# 3. 新建可发布的库
uv init --lib my-sdk
# → lib 模式，生成 src/my_sdk/__init__.py

# 4. 指定 Python 版本
uv init my-api --python 3.12
# → 同时创建 .python-version 锁定版本

# 5. 指定项目名（区别于目录名）
uv init my-project --name awesome-api
# → 目录叫 my-project/，但包名叫 awesome-api

# 6. 不初始化 git
uv init my-project --vcs none

# 7. 纯脚本项目（无包结构）
uv init my-scripts --no-package --no-readme

# 8. 自定义构建后端
uv init my-lib --lib --build-backend setuptools
```

---

## `uv add` - 添加依赖（详解）

### 完整语法

```
uv add [OPTIONS] <PACKAGES>...
```

### 版本指定方式

```bash
# 精确版本（≈ package.json 的 "1.0.0"）
uv add "fastapi==0.115.0"

# 范围版本（≈ "^1.0.0"）
uv add "fastapi>=0.100.0,<1.0.0"

# 通配符
uv add "fastapi==0.115.*"

# 最新版（不指定）
uv add fastapi

# 从 Git 仓库
uv add "httpx @ git+https://github.com/encode/httpx.git"
uv add "httpx @ git+https://github.com/encode/httpx.git@v1.0"
uv add "httpx @ git+https://github.com/encode/httpx.git@main"

# 从本地路径
uv add "/path/to/local/package"
uv add "../my-other-project"

# 从 URL（Wheel / sdist）
uv add "https://files.pythonhosted.org/packages/.../package-1.0-py3-none-any.whl"
```

### 所有选项

| 选项 | 说明 | 示例 |
|------|------|------|
| `--dev` | 添加到开发依赖 (`[dependency-groups].dev`) | `uv add --dev pytest` |
| `--group <GROUP>` | 添加到自定义依赖组 | `uv add --group test pytest` |
| `--optional <GROUP>` | 添加到可选依赖 (`[project.optional-dependencies]`) | `uv add --optional redis redis` |
| `--extra <NAME>` | 安装时包含指定 extras | `uv add "uvicorn[standard]"` |
| `--no-sync` | 只修改 toml/lock，不安装 | `uv add fastapi --no-sync` |
| `--package <PKG>` | 在 workspace 中指定子包 | `uv add --package api fastapi` |
| `--frozen` | 不更新 lock 文件中已有的其他依赖 | — |
| `--raw-sources` | 使用原始依赖源（不解析） | — |
| `--rev <REV>` | git 引用的具体版本 | `uv add --rev v1.0 git+...` |
| `--tag <TAG>` | git 标签 | `uv add --tag v1.0 git+...` |
| `--branch <BRANCH>` | git 分支 | `uv add --branch main git+...` |

### 添加可选依赖（extras）

```bash
# 安装 uvicorn 的标准扩展（含 websockets、httptools 等）
uv add "uvicorn[standard]"

# 安装 pydantic 的 email 验证扩展
uv add "pydantic[email]"
```

### 依赖组（dependency-groups）实战

```bash
uv add --dev pytest ruff mypy            # 开发组
uv add --group test pytest-asyncio httpx # 自定义测试组
uv add --group lint ruff                 # 自定义 lint 组
uv add --optional redis redis hiredis    # 可选依赖组（用户 pip install xx[redis] 安装）
```

---

## `uv remove` - 移除依赖

```bash
# 移除生产依赖
uv remove fastapi

# 移除多个
uv remove fastapi uvicorn

# 从开发依赖移除
uv remove --dev pytest

# 从指定组移除
uv remove --group test httpx

# 从可选依赖移除
uv remove --optional redis redis
```

---

## `uv sync` - 同步环境（详解）

`uv sync` 是 uv 的核心命令之一，它会：
1. 如果 `.venv` 不存在，自动创建虚拟环境
2. 按照 `uv.lock` 文件精确安装所有依赖
3. 安装当前项目自身（editable 模式）

### 所有选项

| 选项 | 说明 | 前端类比 |
|------|------|----------|
| (无) | 安装所有依赖（含 dev） | `pnpm install` |
| `--no-dev` | 跳过开发依赖组 | `pnpm install --prod` |
| `--no-editable` | 不使用可编辑安装 | — |
| `--no-default-groups` | 跳过默认 dev 组 | — |
| `--group <GROUP>` | 仅安装指定组 | — |
| `--no-group <GROUP>` | 排除指定组 | — |
| `--upgrade` / `-U` | 升级所有依赖到最新兼容版本 | `pnpm update` |
| `--upgrade-package <PKG>` | 仅升级指定包 | `pnpm update xxx` |
| `--frozen` | 严格按 lock 文件，并检查一致性 | `npm ci` |
| `--reinstall` | 强制重装所有包 | `rm -rf node_modules && install` |
| `--reinstall-package <PKG>` | 仅重装指定包 | — |
| `--no-install-project` | 不安装当前项目自身 | — |
| `--python <VERSION>` | 使用指定 Python | — |

```bash
# 生产环境（跳过 dev 依赖）
uv sync --frozen --no-dev

# 升级所有包
uv sync --upgrade

# 仅升级 fastapi
uv sync --upgrade-package fastapi

# 仅安装指定组
uv sync --group test

# 安装生产依赖 + 可选 redis 组
uv sync --no-dev --group redis

# CI 环境（严格模式）
uv sync --frozen
```

---

## `uv lock` - 锁定依赖

```bash
# 解析并生成 uv.lock
uv lock

# 仅检查是否过期（CI 中使用）
uv lock --check

# 升级锁文件
uv lock --upgrade

# 仅升级某个包
uv lock --upgrade-package fastapi

# 详细输出解析过程
uv lock --verbose
```

`uv.lock` 文件内容：
- 跨平台锁定（可在 macOS 生成，Linux 使用）
- 记录所有依赖的精确版本和 hash
- 应提交到 Git

---

## `uv run` / `uvx` - 运行命令（详解）

### `uv run` — 在项目环境中运行

```
uv run [OPTIONS] <COMMAND>
```

```bash
# 运行 Python 脚本
uv run python main.py

# 运行已安装的工具
uv run pytest
uv run ruff check .
uv run mypy src/

# 传递参数
uv run pytest -v -k "test_user"

# 运行 pyproject.toml 中 [project.scripts] 定义的命令
uv run my-app        # 等价于 python -m hello:main

# 选项
uv run --no-sync pytest        # 跳过自动 sync
uv run --python 3.12 pytest    # 指定 Python
uv run --isolated pytest       # 隔离运行（忽略项目配置）
```

### `uvx` — 运行一次性工具（不装到项目）

`uvx` 是 `uv tool run` 的简写，等价于 `npx`。

```bash
# 运行任意 PyPI 工具（自动下载、缓存、运行、清理）
uvx ruff check .
uvx black --check .
uvx httpie https://api.github.com

# 指定版本
uvx ruff@0.8.0 check .

# 运行已全局安装的工具
uvx ruff check .   # 如果全局已装过，直接用全局版
```

---

## `uv python` - Python 版本管理（详解）

uv 内置了 Python 版本管理，无需额外安装 pyenv 或 nvm 类比工具。

### 子命令一览

```bash
# 列出所有可安装的 Python 版本（远端）
uv python list

# 列出所有可安装版本（含预发布、已废弃）
uv python list --all-versions

# 仅列已安装的
uv python list --only-installed

# 安装
uv python install 3.12          # 安装 CPython 3.12 最新
uv python install 3.12.3        # 精确版本
uv python install 3.11 3.12 3.13 # 安装多个

# 卸载
uv python uninstall 3.11

# 查找
uv python find                  # 当前项目的 Python 路径
uv python find 3.12             # 指定版本的路径

# 固定项目版本
uv python pin 3.12              # 创建 .python-version
uv python pin --resolved 3.12   # 解析到精确版本号

# 查看当前 Python
uv python which                 # 等价于 which python
```

### 支持的 Python 实现

| 实现 | 说明 |
|------|------|
| CPython (`cpython-3.12`) | 默认，标准 Python |
| PyPy (`pypy-3.10`) | JIT 加速的 Python |
| GraalPy (`graalpy-3.12`) | Oracle GraalVM Python |

```bash
# 安装 PyPy
uv python install pypy@3.10
```

---

## `uv venv` - 虚拟环境管理

```bash
# 创建虚拟环境（默认 .venv）
uv venv

# 指定路径和 Python 版本
uv venv .venv --python 3.12

# 指定 Python 实现
uv venv .venv --python pypy@3.10

# 允许使用系统 site-packages
uv venv .venv --system-site-packages

# 创建时不安装 seed 包（更纯净）
uv venv .venv --no-seed

# 激活方式（macOS/Linux）
source .venv/bin/activate

# 退出
deactivate
```

> **提示**：使用 `uv run` 时不需要手动激活 venv，uv 会自动管理。

---

## `uv tree` - 依赖树

```bash
# 显示完整依赖树
uv tree

# 限制深度
uv tree --depth 2

# 只看某个包的依赖
uv tree --package fastapi

# 反向查找（哪些包依赖了 xx）
uv tree --invert --package httpx

# 带更新提示
uv tree --outdated

# 冻结输出（版本精确，可复现）
uv tree --frozen
```

---

## `uv build` / `uv publish` - 构建与发布

```bash
# 构建源码分发包 (sdist) 和 wheel
uv build

# 指定输出目录
uv build --out-dir dist/

# 仅构建 sdist
uv build --sdist

# 仅构建 wheel
uv build --wheel

# 发布到 PyPI
uv publish

# 发布到 Test PyPI（先测试）
uv publish --publish-url https://test.pypi.org/legacy/

# 指定 token
uv publish --token pypi-xxxx
```

---

## `uv tool` - 全局工具管理

用于全局安装 CLI 工具（类似 `npm install -g` + `npx`）。

```bash
# 安装全局工具
uv tool install ruff
uv tool install "ruff>=0.8"

# 从本地路径安装
uv tool install /path/to/mycli

# 列出已安装的工具
uv tool list

# 升级工具
uv tool upgrade ruff
uv tool upgrade --all

# 卸载
uv tool uninstall ruff

# 运行已安装的工具
uvx ruff check .       # 等价于 uv tool run ruff check .

# 查看工具安装路径
uv tool dir
```

---

## `uv cache` - 缓存管理

```bash
# 查看缓存目录路径
uv cache dir

# 清理所有缓存
uv cache clean

# 清理指定包缓存
uv cache clean fastapi
```

---

## `uv pip` - pip 兼容层

uv 提供了完整的 `pip` 兼容接口，适合渐进式迁移。

```bash
# 从 requirements.txt 安装
uv pip install -r requirements.txt

# 冻结当前环境的包
uv pip freeze > requirements.txt

# 编译依赖（pip-compile 风格）
uv pip compile requirements.in -o requirements.txt

# 安装单个包
uv pip install fastapi

# 卸载
uv pip uninstall fastapi

# 列出已安装
uv pip list
```

---

## `uv export` - 导出依赖

```bash
# 导出为 requirements.txt（给不用 uv 的队友/CI）
uv export --format requirements-txt -o requirements.txt

# 仅生产依赖
uv export --no-dev --format requirements-txt

# 导出特定组
uv export --group test --format requirements-txt
```

---

## 实战工作流总结

### 场景 1：从零开始 FastAPI 项目

```bash
uv init my-api
cd my-api
uv add fastapi uvicorn[standard] pydantic
uv add --dev pytest httpx ruff mypy
uv run uvicorn app:app --reload
```

### 场景 2：克隆已有 uv 项目

```bash
git clone <repo>
cd <repo>
uv sync              # 一键创建 .venv + 安装全部依赖
uv run pytest        # 跑测试验证
```

### 场景 3：CI/CD (GitHub Actions)

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: astral-sh/setup-uv@v5
  - run: uv sync --frozen
  - run: uv run ruff check .
  - run: uv run mypy .
  - run: uv run pytest -v
```

### 场景 4：给已有项目快速加 lint

```bash
uv add --dev ruff
uv run ruff check . --fix    # 自动修复
```

### 场景 5：运行别人的脚本

```bash
# 免安装，直接用
uvx httpie https://api.example.com/users
uvx black --check --diff script.py
uvx cookiecutter gh:user/template
```

---

## 完整命令速查表

| 命令 | 用途 | 最常用 |
|------|------|--------|
| `uv init` | 初始化项目 | ⭐⭐⭐⭐⭐ |
| `uv add` | 添加依赖 | ⭐⭐⭐⭐⭐ |
| `uv sync` | 同步环境 | ⭐⭐⭐⭐⭐ |
| `uv run` | 运行命令 | ⭐⭐⭐⭐⭐ |
| `uvx` | 运行一次性工具 | ⭐⭐⭐⭐ |
| `uv python install` | 安装 Python | ⭐⭐⭐⭐ |
| `uv remove` | 移除依赖 | ⭐⭐⭐ |
| `uv lock` | 锁定依赖 | ⭐⭐⭐ |
| `uv tree` | 查看依赖树 | ⭐⭐⭐ |
| `uv venv` | 管理虚拟环境 | ⭐⭐ |
| `uv build` | 构建包 | ⭐⭐ |
| `uv publish` | 发布到 PyPI | ⭐⭐ |
| `uv tool install` | 全局工具 | ⭐⭐ |
| `uv pip` | pip 兼容 | ⭐⭐ |
| `uv cache clean` | 清理缓存 | ⭐ |
| `uv export` | 导出依赖 | ⭐ |

---

## 更多资源

- 官方文档：[docs.astral.sh/uv](https://docs.astral.sh/uv/)
- GitHub：[astral-sh/uv](https://github.com/astral-sh/uv)
- 迁移指南：[docs.astral.sh/uv/guides](https://docs.astral.sh/uv/guides/)
