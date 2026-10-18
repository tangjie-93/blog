---
title: "Poetry 命令详解"
date: "2026-03-25"
type: "技术"
tags: "Python"
note: "整理 Poetry 项目创建、依赖管理、打包发布与常见工作流。"
---

# `Poetry` 命令详解

> `Python` 现代依赖管理工具

---

## 1、📋 目录

- [🚀 项目生命周期管理](#_1️⃣-项目生命周期管理)
- [📦 依赖管理](#_2️⃣-依赖管理)
- [🏗️ 打包与发布](#_3️⃣-打包与发布)
- [⚙️ 配置与维护](#_4️⃣-配置与维护)
- [💡 核心工作流示例](#_5️⃣-核心工作流示例)
- [📋 配置文件说明](#_6️⃣-配置文件说明)

---

## 2、1️⃣ 项目生命周期管理

| 命令 | 作用 | 典型使用场景 | 与 pip/venv 对比 |
| :--- | :--- | :--- | :--- |
| `poetry new my-project` | 创建一个**新项目**的标准目录结构 | 当你从零开始一个`Python`项目时 | 替代手动创建目录和文件 |
| `poetry init` | 在**现有项目**中**交互式**地生成 `pyproject.toml` 文件 | 当你有一个旧项目，想改用`Poetry`管理时 | 替代手动编写 `requirements.txt` |
| `poetry install` | **安装** `pyproject.toml` 中的所有依赖 | 当你刚克隆一个`Poetry`项目，或需要同步队友添加的依赖时 | 相当于 `pip install -r requirements.txt`，但更智能，会自动创建虚拟环境 |
| `poetry update` | **更新所有依赖**到最新版本，并更新 `poetry.lock` 文件 | 定期批量升级项目依赖包 | 相当于 `pip install --upgrade` 批量操作 |
| `poetry shell` | **激活**当前项目的虚拟环境 | 你想在项目环境下连续运行多个命令 | 相当于 `venv\Scripts\activate` (Windows) 或 `source venv/bin/activate` (`Linux`/macOS) |
| `poetry run <command>` | 在虚拟环境中**运行单个命令**，无需先激活环境 | 运行脚本 `poetry run python app.py` 或执行测试 `poetry run pytest` | 无需手动激活环境，非常方便 |
| `poetry env info` | 查看当前项目虚拟环境的**详细信息**（路径、`Python`版本等） | 当你在IDE（如VSCode）中需要手动指定解释器路径时 | `pip` 无此功能 |

---

## 3、2️⃣ 依赖管理

| 命令 | 作用 | 典型使用场景 | 与 pip/venv 对比 |
| :--- | :--- | :--- | :--- |
| `poetry add requests` | **添加**一个依赖到生产环境并安装 | 你的项目需要用 `requests` 库 | 相当于 `pip install requests`，同时自动更新配置文件 |
| `poetry add pytest --dev` | **添加**一个依赖到开发环境（如测试、文档工具） | 你只想在开发时用 `pytest`，打包到生产环境时不包含它 | 相当于维护两个 `requirements.txt` 文件 |
| `poetry add pendulum@^2.0.5` | **添加**指定版本的依赖 | 你需要 `pendulum` 库的2.0.5及以上（但低于3.0）版本 | `pip install pendulum>=2.0.5,<3.0.0` |
| `poetry remove requests` | **移除**一个依赖 | 项目不再需要 `requests` 库 | `pip uninstall requests`，但`poetry remove`会同时移除孤儿子依赖，更干净 |
| `poetry show` | 列出所有已安装的依赖 | 你想快速查看当前项目装了哪些包 | 相当于 `pip list` |
| `poetry show --tree` | 以**树状图**形式展示依赖关系 | 排查复杂的依赖冲突时，直观地看到是谁引用了谁 | `pip` 需要安装第三方包（如 `pipdeptree`）才能实现 |

---

## 4、3️⃣ 打包与发布

| 命令 | 作用 | 典型使用场景 | 与 pip/venv 对比 |
| :--- | :--- | :--- | :--- |
| `poetry build` | 将项目**打包**成分发包（源码包和wheel包） | 你写了一个库，准备分享给别人用 | 替代 `python setup.py sdist bdist_wheel` 等复杂命令 |
| `poetry publish` | 将打好的包**发布**到PyPI | 把你的库正式发布到官方仓库，让全世界都能用 `pip install` 安装 | 替代 `twine upload dist/*` |

---

## 5、4️⃣ 配置与维护

| 命令 | 作用 | 典型使用场景 | 与 pip/venv 对比 |
| :--- | :--- | :--- | :--- |
| `poetry config --list` | 查看当前的**配置** | 你想知道虚拟环境被创建在了哪里 | `pip` 无此功能 |
| `poetry config virtualenvs.in-project true` | **配置**虚拟环境创建在项目目录内（生成 `.venv` 文件夹） | 你喜欢把环境放在项目根目录，方便管理和删除 | `python -m venv .venv` |
| `poetry check` | **检查** `pyproject.toml` 文件是否有错误 | 手动编辑配置文件后，验证一下格式是否正确 | `pip` 无此功能 |
| `poetry self update` | **更新** `Poetry` 自身到最新版本 | 官方发布了新功能，你想体验一下 | `pip install --upgrade poetry` |

---

## 6、5️⃣ 核心工作流示例

### 1. 接手一个 `Poetry` 项目

```bash
# 克隆项目
git clone <your-project-url>
cd your-project

# 一条命令，自动创建虚拟环境并安装所有依赖
poetry install

# 激活环境，开始开发
poetry shell
```

### 2. 启动一个全新项目

```bash
# 创建新项目
poetry new my-awesome-tool
cd my-awesome-tool

# 添加核心依赖
poetry add requests beautifulsoup4

# 添加开发依赖
poetry add --dev pytest black

# ... 编写代码 ...

# 运行你的程序
poetry run python my_awesome_tool/main.py
```

### 3. 部署应用到服务器

```bash
# 打包应用
poetry build

# 上传到服务器
scp dist/* user@server:~/my-awesome-tool/

# 在服务器上安装依赖并运行
ssh user@server
cd my-awesome-tool
poetry install --no-dev
poetry run python my_awesome_tool/main.py
```

---

## 7、📝 常用命令速记口诀

| 操作 | 命令 |
| :--- | :--- |
| 新项目 | `poetry new` |
| 加依赖 | `poetry add` |
| 删依赖 | `poetry remove` |
| 装全部 | `poetry install` |
| 跑命令 | `poetry run` |
| 进环境 | `poetry shell` |
| 看列表 | `poetry show` |
| 打压缩 | `poetry build` |
| 发上去 | `poetry publish` |

---

## 8、6️⃣ 配置文件说明

### 8.1 pyproject.toml（项目声明文件）

```bash
[tool.poetry]
name = "my-project"
version = "0.1.0"
description = "项目描述"
authors = ["Your Name <email@example.com>"]

[tool.poetry.dependencies]
python = "^3.8"
requests = "^2.28.0"
pendulum = "^2.1.0"

[tool.poetry.dev-dependencies]
pytest = "^7.0.0"
black = "^22.0.0"
```

### 8.2 poetry.lock（版本锁定文件）

- 记录了所有依赖的**精确版本号**
- 必须提交到版本控制系统（git）
- 确保所有人、所有环境使用**完全一致**的依赖

---

*更新时间：`2026-03-17`*
