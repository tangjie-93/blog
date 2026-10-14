---
title: "PostgreSQL 数据库配置与 DBeaver 连接指南"
date: "2026-04-15"
type: "技术"
tags: "Python"
note: "在 macOS 上安装 PostgreSQL，配置数据库并使用 DBeaver 连接。"
---

# PostgreSQL 数据库配置与 DBeaver 连接指南

## 一、PostgreSQL 安装与配置

### 1. macOS 安装 PostgreSQL

#### 方法一：使用 Homebrew（推荐）
```bash
# 安装 PostgreSQL
brew install postgresql

# 启动 PostgreSQL 服务
brew services start postgresql

# 查看 PostgreSQL 状态
brew services list

# 停止 PostgreSQL 服务
brew services stop postgresql
```

#### 方法二：使用 Postgres.app
1. 访问 https://postgresapp.com/
2. 下载并安装
3. 打开 Postgres.app 应用
4. 点击 "+" 创建新服务器

### 2. 创建数据库和用户

```bash
# 以 postgres 用户登录 PostgreSQL
psql postgres

# 创建数据库
CREATE DATABASE fastapi_db;

# 创建用户（如果还没有）
CREATE USER postgres WITH SUPERUSER;
ALTER USER postgres WITH PASSWORD 'postgres';

# 或者创建新用户
CREATE USER fastapi_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fastapi_db TO fastapi_user;

# 退出
\q
```

### 3. 验证连接

```bash
# 测试连接
psql -U postgres -d fastapi_db -h localhost -p 5432
```

---

## 二、DBeaver 连接 PostgreSQL 数据库

### 1. 下载与安装 DBeaver

- **官网**: https://dbeaver.io/download/
- **版本选择**:
  - DBeaver Community（社区版）：免费，功能强大
  - DBeaver Enterprise（企业版）：付费，更多功能
- **推荐**: 下载 Community 社区版即可

### 2. 创建新连接

#### 步骤一：打开新建连接向导
1. 启动 DBeaver
2. 点击菜单栏 **数据库 (Database)** → **新建连接 (New Connection)**
3. 或使用快捷键：`Ctrl + N` (Windows/Linux) 或 `Cmd + Shift + N` (Mac)

#### 步骤二：选择数据库类型
1. 在左侧列表中选择 **PostgreSQL**
2. 点击 **下一步 (Next)**

#### 步骤三：配置连接参数

填写以下信息：

| 字段 | 值 | 说明 |
|------|-----|------|
| **主机 (Host)** | `localhost` | 本地数据库 |
| **端口 (Port)** | `5432` | PostgreSQL 默认端口 |
| **数据库名 (Database)** | `fastapi_db` | 要连接的数据库 |
| **用户名 (Username)** | `postgres` | 数据库用户 |
| **密码 (Password)** | `postgres` | 用户密码 |

#### 步骤四：测试连接
1. 点击左下角的 **测试连接 (Test Connection)** 按钮
2. 首次连接时，DBeaver 会提示下载 PostgreSQL JDBC 驱动
3. 点击 **下载 (Download)** 自动安装驱动
4. 如果连接成功，会显示 "Connected" 提示

#### 步骤五：完成连接
1. 点击 **完成 (Finish)** 保存连接
2. 连接会出现在左侧的 **数据库导航 (Database Navigator)** 面板中

### 3. DBeaver 常用操作

#### 浏览数据库结构
- 展开连接 → **databases** → **fastapi_db**
  - **public** 模式
    - **Tables**: 查看所有表
    - **Views**: 查看视图
    - **Functions**: 查看函数
    - **Sequences**: 查看序列

#### 执行 SQL 查询
1. 右键点击数据库连接
2. 选择 **SQL 编辑器 (SQL Editor)** → **打开 SQL 编辑器 (Open SQL Editor)**
3. 或使用快捷键：`F3`

#### 常用 SQL 命令

```sql
-- 查看所有表
\dt

-- 查看表结构
\d table_name

-- 查询数据
SELECT * FROM users LIMIT 10;

-- 查看数据库信息
SELECT version();

-- 查看所有数据库
\l

-- 切换数据库
\c fastapi_db
```

#### 导入/导出数据
1. 右键点击表名
2. 选择 **导入数据 (Import Data)** 或 **导出数据 (Export Data)**
3. 按照向导操作

#### 查看 ER 图
1. 右键点击数据库或模式
2. 选择 **查看图 (View Diagram)** 或 **ER 图 (ER Diagram)**
3. 可视化查看表关系

---

## 三、项目配置

### 1. 创建 .env 文件

在 `FastAPI/backend` 目录下创建 `.env` 文件：

```bash
cd FastAPI/backend
cp .env.example .env
```

### 2. 配置环境变量

编辑 `.env` 文件，确保数据库连接字符串正确：

```dotenv
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/fastapi_db
```

### 3. 安装依赖

```bash
cd FastAPI/backend
pip install -r requirements.txt
```

### 4. 创建数据库表

启动应用时会自动创建表，或者手动执行：

```bash
cd FastAPI/backend
python -c "from app.core.database import create_db_and_tables; create_db_and_tables()"
```

---

## 四、常见问题排查

### 1. 连接失败：Connection refused

**原因**: PostgreSQL 服务未启动

**解决方法**:
```bash
# macOS (Homebrew)
brew services start postgresql

# 或者手动启动
pg_ctl -D /usr/local/var/postgres start
```

### 2. 认证失败：Password authentication failed

**原因**: 密码错误或用户不存在

**解决方法**:
```bash
# 重置 postgres 用户密码
psql postgres
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

### 3. 数据库不存在：Database "fastapi_db" does not exist

**原因**: 数据库未创建

**解决方法**:
```bash
createdb -U postgres fastapi_db
```

### 4. DBeaver 驱动下载失败

**解决方法**:
1. 手动下载 PostgreSQL JDBC 驱动
2. 访问：https://jdbc.postgresql.org/
3. 下载最新版本的 `.jar` 文件
4. 在 DBeaver 连接设置中，手动指定驱动路径

### 5. 权限不足：Permission denied

**原因**: 用户没有数据库权限

**解决方法**:
```bash
psql postgres
GRANT ALL PRIVILEGES ON DATABASE fastapi_db TO postgres;
\q
```

---

## 五、DBeaver 快捷键参考

| 快捷键 | 功能 |
|--------|------|
| `F3` | 打开 SQL 编辑器 |
| `Ctrl + Enter` | 执行 SQL 语句 |
| `Ctrl + Shift + H` | 显示查询历史 |
| `Ctrl + Space` | 代码自动补全 |
| `Ctrl + /` | 注释/取消注释 |
| `F4` | 查看表详情 |
| `F5` | 刷新连接 |

---

## 六、推荐的 DBeaver 设置

### 1. 编辑器设置
- **窗口** → **首选项** → **编辑器** → **SQL 编辑器**
  - 启用自动补全
  - 启用语法高亮
  - 启用格式化

### 2. 结果集设置
- **窗口** → **首选项** → **编辑器** → **数据编辑器**
  - 设置每页显示的行数（建议 100）
  - 启用自动提交（开发环境）

### 3. 外观设置
- **窗口** → **首选项** → **外观**
  - 选择喜欢的主题（Dark/Light）
  - 调整字体大小

---

## 七、安全建议

### 生产环境配置

1. **使用强密码**:
   ```dotenv
   DATABASE_URL=postgresql+psycopg://user:StrongP@ssw0rd!@host:5432/dbname
   ```

2. **不要使用默认端口**:
   ```bash
   # 修改 postgresql.conf
   port = 5433
   ```

3. **限制远程访问**:
   ```bash
   # 修改 pg_hba.conf
   host    all             all             127.0.0.1/32            scram-sha-256
   ```

4. **使用环境变量**:
   ```bash
   # 不要将 .env 提交到 Git
   echo ".env" >> .gitignore
   ```

---

## 八、参考资料

- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [DBeaver 官方文档](https://dbeaver.com/docs/)
- [SQLModel 文档](https://sqlmodel.tiangolo.com/)
- [FastAPI 文档](https://fastapi.tiangolo.com/)
