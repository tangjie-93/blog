---
title: "Poetry pyproject.toml 配置文件详解"
date: "2026-03-25"
type: "技术"
tags: "Python"
note: "详解 pyproject.toml 的项目元数据、依赖组、构建与工具配置。"
---

# `Poetry` `pyproject.toml` 配置文件详解

`pyproject.toml` 是 `Python` 项目的核心配置文件，采用 TOML 格式。它定义了项目的元数据、依赖管理、构建系统配置等信息。`Poetry` 使用这个文件来管理项目的依赖和发布。

---

## 1、目录

1. [文件结构概览](#_1-文件结构概览)
2. [project 区域详解](#_2-project-区域详解)
3. [build-`system` 区域详解](#_3-build-system-区域详解)
4. [`tool.poetry` 区域详解](#_4-tool-poetry-区域详解)
5. [`tool` 扩展区域](#_5-tool-扩展区域)
6. [完整配置示例](#_6-完整配置示例)
7. [常用命令](#_7-常用命令)

---

## 1. 文件结构概览

一个完整的 `pyproject.toml` 文件通常包含以下区域：

```json
[project]                    # PEP 621 标准元数据
name = "my-project"
version = "0.1.0"
description = "项目描述"
authors = ["Name <email@example.com>"]
dependencies = []

[project.optional-dependencies]  # 可选依赖
dev = ["pytest", "black"]

[build-system]                 # 构建系统
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"

[tool.poetry]                  # Poetry 特定配置
name = "my-project"
package-mode = "false"

[tool.poetry.group]            # 依赖组
[tool.poetry.scripts]          # 入口脚本

[tool.black]                   # 工具配置
[tool.ruff]
[tool.pytest]
```

---

## 2. project 区域详解

`[project]` 区域遵循 [PEP 621](https://peps.python.org/pep-0621/) 标准，是 `Python` 项目的官方元数据规范。

### 3.1 `2.1` 基础元数据

```json
[project]
name = "my-fastapi-app"           # 项目名称（必填）
version = "0.1.0"                  # 版本号（必填）
description = "这是一个 FastAPI 项目"  # 项目描述
readme = "README.md"              # README 文件路径
license = {text = "MIT"}           # 许可证（可使用 ID 或 text）
authors = [
    {name = "张三", email = "zhangsan@example.com"},
    {name = "李四", email = "lisi@example.com"}
]
maintainers = [
    {name = "王五", email = "wangwu@example.com"}
]
keywords = ["fastapi", "web", "api"]  # 关键词
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]
```

### 3.2 `2.2` `Python` 版本要求

```json
requires-python = ">=3.11"        # 最低 Python 版本
```

常用写法：

| 写法 | 说明 |
|------|------|
| `>=3.11` | `Python` `3.11` 及以上 |
| `>=3.10,<4.0` | `Python` `3.10` 到 `4.0` 之间 |
| `>=3.11,<3.13` | `Python` `3.11` 到 `3.12` 之间 |

### 3.3 `2.3` 依赖管理

#### 主依赖

```json
dependencies = [
    "fastapi>=0.100.0",
    "uvicorn[standard]>=0.23.0",
    "pydantic>=2.0.0",
    "sqlmodel>=0.0.14",
    # 特定版本
    "requests==2.31.0",
    # 范围版本
    "django>=4.0,<5.0",
    # 兼容版本
    "numpy~=1.24.0",
    # 额外功能
    "uvicorn[standard]",
]
```

依赖版本规范：

| 符号 | 说明 | 示例 |
|------|------|------|
| `==` | 精确版本 | `==1.0.0` |
| `!=` | 不等于 | `!=1.0.0` |
| `>` `<` `>=` `<=` | 范围 | `>=1.0.0` |
| `~=` | 兼容版本 | `~=1.4.0` 相当于 `>=1.4.0,<2.0.0` |
| `*` | 通配符 | `1.*` 相当于 `>=1.0.0,<2.0.0` |

#### 可选依赖（ extras）

```json
[project.optional-dependencies]
# 开发依赖
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
    "black>=23.0.0",
    "ruff>=0.0.280",
    "mypy>=1.0.0",
]

# 测试依赖
test = [
    "pytest>=7.0.0",
    "pytest-cov>=4.0.0",
    "httpx>=0.24.0",
]

# 文档依赖
docs = [
    "mkdocs>=6.0.0",
    "mkdocs-material>=9.0.0",
]

# 服务器依赖（如 PostgreSQL 客户端）
server = [
    "asyncpg>=0.28.0",
    "psycopg2-binary>=2.9.0",
]

# 所有依赖（用于 pip install）
all = [
    "fastapi-project[dev,test,docs,server]",
]
```

#### 依赖来源

```json
dependencies = [
    # PyPI 包
    "fastapi",
    
    # 带版本
    "uvicorn[standard]>=0.23.0",
    
    # 本地包
    "my-package @ file:///path/to/package",
    
    # Git 仓库
    "my-package @ git+https://github.com/user/repo.git@v1.0.0",
    "my-package @ git+https://github.com/user/repo.git@branch-name",
    
    # 私有包
    "my-private-package @ https://example.com/package.whl",
]
```

### 3.4 `2.4` 脚本入口点

```json
[project.scripts]
# 格式：命令名 = "模块名:函数名"
myapp = "myapp.main:main"
gunicorn = "gunicorn.main:main"

# FastAPI 应用入口
fastapi-app = "main:app"  # poetry run fastapi-app
```

### 3.5 `2.5` 其他配置

```json
# 项目 URL
[project.urls]
Homepage = "https://github.com/username/project"
Repository = "https://github.com/username/project"
Documentation = "https://docs.example.com"
Changelog = "https://github.com/username/project/blob/main/CHANGELOG.md"
Issues = "https://github.com/username/project/issues"

# 入口点（不需要写在这里，Poetry 自动处理）
# [project.entry-points]
# py:test = "pytest"
```

---

## 3. build-`system` 区域详解

`[build-system]` 定义了项目的构建系统。

```json
[build-system]
requires = ["poetry-core>=2.0.0,<3.0.0"]  # 构建所需依赖
build-backend = "poetry.core.masonry.api"  # 构建后端
```

常用构建后端：

| 构建后端 | 说明 |
|----------|------|
| `poetry.core.masonry.api` | `Poetry`（推荐） |
| `setuptools.build_meta` | Setuptools |
| `hatchling.build` | Hatch |
| `flit_core.buildapi` | Flit |

---

## 4. `tool.poetry` 区域详解

`[tool.poetry]` 是 `Poetry` 特定的配置文件，定义项目打包和依赖管理的详细行为。

### 5.1 `4.1` 基本配置

```json
[tool.poetry]
name = "my-fastapi-project"           # 包名（必填）
version = "0.1.0"                     # 版本（必填）
description = "项目详细描述"            # 详细描述
authors = ["张三 <zhangsan@example.com>"]  # 作者
maintainers = ["李四 <lisi@example.com>"]  # 维护者
license = "MIT"                       # 许可证
readme = "README.md"                  # README 文件
documentation = "https://docs.example.com"  # 文档 URL
```

### 5.2 `4.2` 包配置

```json
# 包模式配置
package-mode = "true"   # true: 包含源码包; false: 作为单一模块

# 需要包含的包（用于多包项目）
packages = [
    {include = "my_package"},
    {include = "my_package", format = "sdist"},
    {include = "my_package", from = "src"},  # 从 src 目录
]

# 需要排除的文件
exclude = [
    "*.md",
    "tests/",
    "docs/",
]

# 需要包含的文件
include = [
    "package/",
    "py.typed",
]
```

### 5.3 `4.3` 依赖配置

```json
[tool.poetry.dependencies]
# Python 版本
python = "^3.11"

# 主依赖（与 [project] 中的 dependencies 等效）
fastapi = "^0.100.0"
uvicorn = {version = "^0.23.0", extras = ["standard"]}
pydantic = "^2.0.0"
pydantic-settings = "^2.0.0"
sqlmodel = "^0.0.14"

# 可选依赖
mysql = {version = "^8.0.0", optional = true}
postgres = {version = "^15.0.0", optional = true}

[tool.poetry.extras]
# 可选依赖的额外功能
mysql = ["mysql"]
postgres = ["postgres"]
all = ["mysql", "postgres"]

# 开发依赖组
[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-asyncio = "^0.21.0"
httpx = "^0.24.0"
black = "^23.7.0"
ruff = "^0.0.282"
mypy = "^1.5.0"
ipython = "^8.0.0"

[tool.poetry.group.test.dependencies]
pytest-cov = "^4.1.0"
faker = "^19.0.0"

[tool.poetry.group.lint.dependencies]
ruff = "^0.0.282"
mypy = "^1.5.0"
pylint = "^2.17.0"

[tool.poetry.group.docs.dependencies]
mkdocs = "^1.5.0"
mkdocs-material = "^9.0.0"
```

### 5.4 `4.4` 发布配置

```json
[tool.poetry]
# 仓库配置
repository = "https://github.com/username/project"
homepage = "https://github.com/username/project"

# 打包配置
include = ["CHANGELOG.md"]
exclude = ["tests/"]

# 多个包时配置
packages = [
    {include = "my_package", package-dir = "src"},
]
```

### 5.5 `4.5` 脚本配置

```json
[tool.poetry.scripts]
# 安装包时创建的命令
# 格式：命令名 = "模块名:函数名"

# 启动 FastAPI
fastapi-dev = "uvicorn:main"  # 需要安装 uvicorn

# 自定义命令
myapp = "myapp.cli:main"

# 如果使用主应用
app = "main:app"
```

### 5.6 `4.6` 完整的 `tool.poetry` 示例

```json
[tool.poetry]
name = "fastapi-project"
version = "0.1.0"
description = "一个 FastAPI 学习项目"
authors = ["智核 <tang.jie@ecar.com>"]
license = "MIT"
readme = "README.md"
documentation = "https://docs.example.com"
homepage = "https://github.com/example/fastapi-project"
repository = "https://github.com/example/fastapi-project"
keywords = ["fastapi", "python", "web", "api"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]

packages = [{include = "app"}]

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.109.0"
uvicorn = {version = "^0.27.0", extras = ["standard"]}
pydantic = "^2.5.0"
pydantic-settings = "^2.1.0"
sqlmodel = "^0.0.14"
python-jose = {version = "^3.3.0", extras = ["cryptography"]}
passlib = "^1.7.4"
python-multipart = "^0.0.6"
aiofiles = "^23.2.1"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-asyncio = "^0.23.0"
pytest-cov = "^4.1.0"
httpx = "^0.26.0"
black = "^23.12.0"
ruff = "^0.1.0"
mypy = "^1.8.0"
ipython = "^8.20.0"

[tool.poetry.group.test.dependencies]
faker = "^22.0.0"

[tool.poetry.scripts]
app = "main:app"
```

---

## 5. `tool` 扩展区域

`[tool]` 区域用于配置各种 `Python` 工具。

### 6.1 `5.1` Black 代码格式化

```json
[tool.black]
line-length = 100              # 每行最大长度
target-version = ['py311']    # 目标 Python 版本
include = '\.pyi?$'           # 包含的文件
exclude = '''
/(
    \.git
  | \.venv
  | build
  | dist
)/
'''
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
  | __pycache__
)/
'''
```

### 6.2 `5.2` Ruff Linter

```json
[tool.ruff]
line-length = 100
target-version = "py311"

# 启用的规则
select = [
    "E",      # pycodestyle errors
    "W",      # pycodestyle warnings
    "F",      # pyflakes
    "I",      # isort
    "N",      # pep8-naming
    "UP",     # pyupgrade
    "YTT",    # flake8-2020
    "ASYNC",  # flake8-async
    "C4",     # flake8-comprehensions
    "FA",     # flake8-future-annotations
    "PIE",    # flake8-pie
    "T20",    # flake8-print
    "PT",     # flake8-pytest-style
    "RSE",    # flake8-raise
    "RET",    # flake8-return
    "SIM",    # flake8-simplify
    "PTH",    # flake8-use-pathlib
    "PGH",    # pygments
    "PL",     # pylint
    "PERF",   # perflint
    "RUF",    # ruff specific rules
]

# 忽略的规则
ignore = [
    "E501",     # line too long (handled by black)
    "PLR2004",  # magic value comparison
    "SIM115",   # use context handler for opening files
]

# 忽略特定文件
[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]
"tests/*" = ["S101", "PLR2004"]
```

### 6.3 `5.3` MyPy 类型检查

```json
[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = false
disallow_incomplete_defs = false
check_untyped_defs = true
disallow_untyped_calls = false
ignore_missing_imports = true
strict_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true

`tool.mypy.overrides`（原知识库笔记，未收录）
module = "numpy.*"
ignore_missing_imports = true

`tool.mypy.overrides`（原知识库笔记，未收录）
module = "pydantic.*"
ignore_missing_imports = true
```

### 6.4 `5.4` Pytest 测试

```json
[tool.pytest.ini_options]
minversion = "7.0"
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = """
    -ra
    --strict-markers
    --tb=short
    --cov=app
    --cov-report=term-missing
    --cov-report=html
    --cov-report=xml
"""
asyncio_mode = "auto"
markers = [
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
    "integration: marks tests as integration tests",
    "unit: marks tests as unit tests",
]
filterwarnings = [
    "ignore::DeprecationWarning",
    "ignore::PendingDeprecationWarning",
]
```

### 6.5 `5.5` 其他常用工具

#### isort 导入排序

```json
[tool.isort]
profile = "black"
line_length = 100
multi_line_output = 3
include_trailing_comma = true
force_grid_wrap = 0
use_parentheses = true
ensure_newline_before_comments = true

[tool.isort.sections]
known_third_party = ["fastapi", "uvicorn", "pydantic"]
known_first_party = ["app"]
```

#### `coverage.py` 测试覆盖

```json
[tool.coverage.run]
source = ["app"]
omit = [
    "*/tests/*",
    "*/test_*.py",
    "*/__pycache__/*",
]
branch = true

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise AssertionError",
    "raise NotImplementedError",
    "if __name__ == .__main__.:",
    "if TYPE_CHECKING:",
    "@abstractmethod",
]
precision = 2
show_missing = true
skip_covered = false
```

#### Flit（备选构建系统）

```json
[tool.flit.module]
module = "my_package"

[tool.flit.sdist]
include = ["tests/"]
```

---

## 6. 完整配置示例

### 7.1 `FastAPI` 项目完整配置

```json
[project]
name = "fastapi-project"
version = "0.1.0"
description = "FastAPI 学习项目"
authors = [
    {name = "智核", email = "tang.jie@ecar.com"}
]
requires-python = ">=3.11"
license = {text = "MIT"}
readme = "README.md"
keywords = ["fastapi", "python", "web", "api"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
    "Framework :: FastAPI",
]

dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
    "sqlmodel>=0.0.14",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-asyncio>=0.23.0",
    "pytest-cov>=4.1.0",
    "httpx>=0.26.0",
    "black>=23.12.0",
    "ruff>=0.1.0",
    "mypy>=1.8.0",
]
server = [
    "asyncpg>=0.29.0",
    "psycopg2-binary>=2.9.9",
]
all = [
    "fastapi-project[dev,server]",
]

[project.scripts]
app = "main:app"

[build-system]
requires = ["poetry-core>=2.0.0,<3.0.0"]
build-backend = "poetry.core.masonry.api"

[tool.poetry]
name = "fastapi-project"
version = "0.1.0"
description = "FastAPI 学习项目"
authors = ["智核 <tang.jie@ecar.com>"]
license = "MIT"
readme = "README.md"
documentation = "https://docs.example.com"
homepage = "https://github.com/example/fastapi-project"
repository = "https://github.com/example/fastapi-project"
keywords = ["fastapi", "python", "web", "api"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]

packages = [{include = "app"}]

[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.109.0"
uvicorn = {version = "^0.27.0", extras = ["standard"]}
pydantic = "^2.5.0"
pydantic-settings = "^2.1.0"
sqlmodel = "^0.0.14"
python-jose = {version = "^3.3.0", extras = ["cryptography"]}
passlib = "^1.7.4"
python-multipart = "^0.0.6"
aiofiles = "^23.2.1"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-asyncio = "^0.23.0"
pytest-cov = "^4.1.0"
httpx = "^0.26.0"
black = "^23.12.0"
ruff = "^0.1.0"
mypy = "^1.8.0"
ipython = "^8.20.0"

[tool.poetry.scripts]
app = "main:app"

[tool.black]
line-length = 100
target-version = ['py311']

[tool.ruff]
line-length = 100
target-version = "py311"
select = ["E", "W", "F", "I", "N", "UP", "C4", "PIE", "PT", "RSE", "RET", "SIM", "RUF"]
ignore = ["E501", "PLR2004"]

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
ignore_missing_imports = true

[tool.pytest.ini_options]
minversion = "7.0"
testpaths = ["tests"]
asyncio_mode = "auto"
addopts = "-ra --strict-markers --tb=short"

[tool.coverage.run]
source = ["app"]
omit = ["*/tests/*", "*/test_*.py"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise AssertionError",
    "raise NotImplementedError",
    "if __name__ == .__main__.:",
]
```

---

## 7. 常用命令

### 8.1 依赖管理

```bash
# 安装项目依赖
poetry install

# 安装可选依赖
poetry install --with dev
poetry install --extras "server"

# 添加依赖
poetry add fastapi
poetry add uvicorn --optional  # 添加为可选依赖

# 添加开发依赖
poetry add --group dev pytest
poetry add -G dev pytest        # 简写

# 移除依赖
poetry remove fastapi

# 更新依赖
poetry update                   # 更新所有依赖
poetry update fastapi           # 更新指定依赖

# 导出依赖
poetry export -f requirements.txt --output requirements.txt
poetry export -f requirements.txt --with dev --output requirements-dev.txt
```

### 8.2 开发运行

```bash
# 激活虚拟环境
poetry shell

# 运行脚本
poetry run python main.py
poetry run uvicorn main:app --reload
poetry run pytest
poetry run black .
poetry run ruff check .

# 直接运行定义的脚本
poetry run app
```

### 8.3 项目管理

```bash
# 构建包
poetry build

# 发布到 PyPI
poetry publish

# 查看依赖树
poetry show --tree
poetry show --tree --with dev

# 检查过时的依赖
poetry show --outdated

# 列出依赖
poetry show
poetry show --with dev
```

### 8.4 配置工具

```bash
# 初始化项目
poetry init

# 添加项目配置
poetry config virtualenvs.create false  # 不创建虚拟环境
poetry config virtualenvs.in-project true  # 在项目目录创建 .venv
```

---

## 9、附录

### 9.1 字段说明表

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 项目名称 |
| `version` | 是 | 版本号 |
| `description` | 否 | 项目描述 |
| `authors` | 否 | 作者列表 |
| `license` | 否 | 许可证 |
| `readme` | 否 | README 文件 |
| `requires-python` | 否 | `Python` 版本要求 |
| `dependencies` | 否 | 主依赖 |
| `optional-dependencies` | 否 | 可选依赖 |

### 9.2 版本号规范

`Poetry` 使用 [Semantic Versioning](https://semver.org/) (语义化版本)：

- **MAJOR** (主版本): 不兼容的 `API` 变更
- **MINOR** (次版本): 向后兼容的新功能
- **PATCH** (补丁版本): 向后兼容的 bug 修复

### 9.3 常见问题

#### 1. 如何指定特定版本的 `Python`？

```toml
python = "^3.11"  # 等价于 >=3.11,<4.0
python = "~3.11"   # 等价于 >=3.11,<3.12
python = "3.11"    # 精确版本（不推荐）
```

#### 2. 如何使用私有仓库？

```bash
poetry config repositories.private https://private.repo.com
poetry add my-package --source private
```

#### 3. 如何处理依赖冲突？

```bash
# 查看依赖树
poetry show --tree

# 强制更新
poetry update --no-ansi
```

---

*文档更新时间：`2026-03-18`*
