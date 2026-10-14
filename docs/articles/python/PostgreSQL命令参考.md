---
title: "PostgreSQL 命令参考"
date: "2026-04-02"
type: "技术"
tags: "Python"
note: "数据库管理、权限、查询、备份恢复和故障排查命令速查。"
---

# PostgreSQL 命令参考

本文档整理了使用 PostgreSQL 数据库时常用的命令，包括服务器管理、数据库操作、用户管理、权限设置、数据操作、备份恢复和监控维护等方面。

## 前言

### 命令使用说明

1. **命令类型**：
   - **系统命令**：直接在终端执行的命令（如 `pg_ctl`、`createdb`、`psql` 等）
   - **SQL 命令**：在 PostgreSQL 交互式终端中执行的命令（如 `CREATE TABLE`、`SELECT` 等）
   - **元命令**：PostgreSQL 交互式终端中的特殊命令，以反斜杠开头（如 `\dt`、`\du` 等）

2. **前置条件**：
   - 部分命令需要先启动 PostgreSQL 服务器
   - 部分命令需要先连接到数据库
   - 命令执行需要相应的权限

3. **参数说明**：
   - 命令中的 `<参数>` 表示需要替换为实际值
   - 例如：`\d table_name` 中的 `table_name` 需要替换为实际的表名

4. **环境配置**：
   - 建议将 PostgreSQL 的 `bin` 目录添加到系统 PATH 中
   - 可以设置环境变量简化命令执行

5. **注意事项**：
   - 生产环境中请谨慎执行删除和修改操作
   - 敏感操作前请做好数据备份
   - 命令执行需要相应的权限

### 快速开始

1. **启动服务器**：
   ```bash
   pg_ctl -D $HOME/postgresql/data start
   ```

2. **连接数据库**：
   ```bash
   psql -d fastapi_db
   ```

3. **执行 SQL 命令**：
   ```sql
   SELECT * FROM users;
   ```

4. **执行元命令**：
   ```
   \dt  -- 查看表
   \du  -- 查看用户
   ```

---

## 目录

1. [服务器管理](#_1-服务器管理)
2. [数据库管理](#_2-数据库管理)
3. [用户管理](#_3-用户管理)
4. [权限管理](#_4-权限管理)
5. [数据操作](#_5-数据操作)
6. [备份与恢复](#_6-备份与恢复)
7. [监控与维护](#_7-监控与维护)
8. [常用配置](#_8-常用配置)
9. [故障排除](#_9-故障排除)

---

## 1. 服务器管理

### 1.1 启动/停止/重启服务器

```bash
# 启动 PostgreSQL 服务器
pg_ctl -D $HOME/postgresql/data start

# 停止 PostgreSQL 服务器
pg_ctl -D $HOME/postgresql/data stop

# 重启 PostgreSQL 服务器
pg_ctl -D $HOME/postgresql/data restart

# 查看服务器状态
pg_ctl -D $HOME/postgresql/data status

# 重新加载配置文件
pg_ctl -D $HOME/postgresql/data reload
```

### 1.2 初始化数据库集群

```bash
# 初始化新的数据库集群
initdb -D $HOME/postgresql/data

# 初始化时指定编码和区域设置
initdb -D $HOME/postgresql/data --encoding=UTF8 --locale=C

# 初始化时指定用户名
initdb -D $HOME/postgresql/data -U postgres
```

### 1.3 日志管理

```bash
# 查看日志文件（默认位置）
tail -f $HOME/postgresql/data/log/postgresql-$(date +%Y-%m-%d).log

# 启动服务器时指定日志级别
pg_ctl -D $HOME/postgresql/data start -l $HOME/postgresql/log/postgresql.log
```

---

## 2. 数据库管理

### 2.1 创建/删除/连接数据库

```bash
# 创建数据库
createdb fastapi_db

# 创建数据库并指定所有者
createdb fastapi_db -O postgres

# 创建数据库并指定编码
createdb fastapi_db -E UTF8

# 删除数据库
dropdb fastapi_db

# 连接到数据库
psql -d fastapi_db

# 连接到数据库并指定用户
psql -d fastapi_db -U postgres

# 连接到数据库并执行SQL命令
psql -d fastapi_db -c "SELECT version();"
```

### 2.2 查看数据库信息

```bash
# 列出所有数据库
psql -l

# 查看当前数据库的表（需要先连接到数据库）
# 前置条件：先执行 psql -d fastapi_db 连接到数据库
\dt

# 查看表结构（需要先连接到数据库）
# 前置条件：先执行 psql -d fastapi_db 连接到数据库
# 参数：table_name 是要查看的表名
\d table_name

# 查看数据库大小（需要先连接到数据库）
# 前置条件：先执行 psql -d fastapi_db 连接到数据库
\l+

# 查看表大小（需要先连接到数据库）
# 前置条件：先执行 psql -d fastapi_db 连接到数据库
\dt+
```

---

## 3. 用户管理

### 3.1 创建/删除/修改用户

```bash
# 创建超级用户
createuser -s postgres

# 创建普通用户
createuser user1

# 创建用户并设置密码（会提示输入密码）
createuser user1 -P

# 删除用户
dropuser user1

# 修改用户密码（需要先连接到数据库）
# 前置条件：先执行 psql -d postgres 连接到数据库
# 参数：user1 是要修改密码的用户名
\password user1

# 修改用户属性（需要先连接到数据库）
# 前置条件：先执行 psql -d postgres 连接到数据库
# 参数：user1 是要修改的用户名，superuser 是要添加的属性
ALTER USER user1 WITH SUPERUSER;
```

### 3.2 查看用户信息

```bash
# 查看所有用户（需要先连接到数据库）
# 前置条件：先执行 psql -d postgres 连接到数据库
\du

# 查看用户详细信息（需要先连接到数据库）
# 前置条件：先执行 psql -d postgres 连接到数据库
\du+
```
---

## 4. 权限管理

### 4.1 授予/撤销权限

```bash
# 授予用户数据库所有权限（需要先连接到数据库）
# 前置条件：先执行 psql -d postgres 连接到数据库
# 参数：fastapi_db 是数据库名，user1 是用户名
GRANT ALL PRIVILEGES ON DATABASE fastapi_db TO user1;

# 授予用户表所有权限（需要先连接到数据库）
# 前置条件：先执行 psql -d fastapi_db 连接到数据库
# 参数：users 是表名，user1 是用户名
GRANT ALL PRIVILEGES ON TABLE users TO user1;

# 授予用户模式权限（需要先连接到数据库）
# 前置条件：先执行 psql -d fastapi_db 连接到数据库
# 参数：public 是模式名，postgres 是用户名
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

# 撤销权限（需要先连接到数据库）
# 前置条件：先执行 psql -d postgres 连接到数据库
# 参数：fastapi_db 是数据库名，user1 是用户名
REVOKE ALL PRIVILEGES ON DATABASE fastapi_db FROM user1;
```

### 4.2 权限查询

```bash
# 查看表权限（需要先连接到数据库）
# 前置条件：先执行 psql -d fastapi_db 连接到数据库
# 参数：table_name 是要查看的表名
\dp table_name

# 查看数据库权限（需要先连接到数据库）
# 前置条件：先执行 psql -d postgres 连接到数据库
\l+
```

---

## 5. 数据操作

### 5.1 基本 SQL 命令

```sql
-- 创建表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入数据
INSERT INTO users (username, email, password) VALUES ('admin', 'admin@example.com', 'hashed_password');

-- 查询数据
SELECT * FROM users;
SELECT * FROM users WHERE id = 1;
SELECT username, email FROM users LIMIT 10;

-- 更新数据
UPDATE users SET email = 'new_email@example.com' WHERE id = 1;

-- 删除数据
DELETE FROM users WHERE id = 1;

-- 创建索引
CREATE INDEX idx_users_email ON users(email);

-- 删除表
DROP TABLE IF EXISTS users;
```

### 5.2 事务管理

```sql
-- 开始事务
BEGIN;

-- 执行操作
UPDATE users SET balance = balance - 100 WHERE id = 1;
UPDATE users SET balance = balance + 100 WHERE id = 2;

-- 提交事务
COMMIT;

-- 回滚事务
ROLLBACK;
```

---

## 6. 备份与恢复

### 6.1 数据库备份

```bash
# 备份整个数据库
pg_dump fastapi_db > fastapi_db_backup.sql

# 备份数据库并压缩
pg_dump fastapi_db | gzip > fastapi_db_backup.sql.gz

# 只备份结构（不包含数据）
pg_dump fastapi_db --schema-only > fastapi_db_schema.sql

# 只备份数据（不包含结构）
pg_dump fastapi_db --data-only > fastapi_db_data.sql

# 使用自定义格式备份（推荐，支持压缩和并行）
pg_dump fastapi_db -F custom -f fastapi_db_backup.dump
```

### 6.2 数据库恢复

```bash
# 恢复数据库（从SQL文件）
psql -d fastapi_db < fastapi_db_backup.sql

# 从压缩文件恢复
zcat fastapi_db_backup.sql.gz | psql -d fastapi_db

# 从自定义格式恢复
pg_restore -d fastapi_db fastapi_db_backup.dump

# 恢复时创建数据库
pg_restore -C -d postgres fastapi_db_backup.dump
```

### 6.3 自动备份脚本

```bash
#!/bin/bash

# 备份目录
BACKUP_DIR="$HOME/postgresql/backup"
mkdir -p $BACKUP_DIR

# 备份文件名
BACKUP_FILE="$BACKUP_DIR/fastapi_db_$(date +%Y-%m-%d_%H-%M-%S).dump"

# 执行备份
pg_dump fastapi_db -F custom -f $BACKUP_FILE

# 保留最近7天的备份
find $BACKUP_DIR -name "*.dump" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

---

## 7. 监控与维护

### 7.1 查看服务器状态

```bash
# 查看服务器状态
pg_isready

# 查看服务器进程
ps aux | grep postgres

# 查看连接数
psql -d fastapi_db -c "SELECT count(*) FROM pg_stat_activity;"
```

### 7.2 数据库维护

```sql
-- 分析表（更新统计信息）
ANALYZE users;

--  vacuum 表（回收空间）
VACUUM users;

-- 完全 vacuum（需要排它锁）
VACUUM FULL users;

-- 查看表大小
SELECT pg_size_pretty(pg_total_relation_size('users'));

-- 查看索引大小
SELECT pg_size_pretty(pg_indexes_size('users'));
```

### 7.3 慢查询分析

```sql
-- 查看当前运行的查询
SELECT pid, usename, query, state FROM pg_stat_activity WHERE state = 'active';

-- 查看查询执行计划
EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';

-- 查看详细执行计划
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

---

## 8. 常用配置

### 8.1 postgresql.conf 配置

```bash
# 编辑配置文件
nano $HOME/postgresql/data/postgresql.conf

# 常用配置参数

# 监听地址（允许远程连接）
listen_addresses = '*'

# 端口
port = 5432

# 最大连接数
max_connections = 100

# 共享内存
shared_buffers = 256MB

# 工作内存
work_mem = 4MB

# 维护工作内存
maintenance_work_mem = 64MB

#  wal 缓冲区
wal_buffers = 16MB

# 自动 vacuum 设置
autovacuum = on
autovacuum_max_workers = 2
autovacuum_naptime = 10min
autovacuum_vacuum_scale_factor = 0.2
autovacuum_analyze_scale_factor = 0.1
```

### 8.2 pg_hba.conf 配置（访问控制）

```bash
# 编辑访问控制文件
nano $HOME/postgresql/data/pg_hba.conf

# 本地连接
local   all             all                                     trust

# IPv4 连接
host    all             all             127.0.0.1/32            trust
host    all             all             192.168.1.0/24          md5

# IPv6 连接
host    all             all             ::1/128                 trust
```

---

## 9. 故障排除

### 9.1 常见错误及解决方法

| 错误信息 | 可能原因 | 解决方法 |
|---------|---------|---------|
| `connection refused` | 服务器未启动或端口被占用 | 启动服务器或检查端口 |
| `password authentication failed` | 密码错误或认证方式不对 | 检查密码或修改认证方式 |
| `permission denied for schema public` | 用户没有模式权限 | 授予用户模式权限 |
| `database "fastapi_db" does not exist` | 数据库不存在 | 创建数据库 |
| `role "postgres" does not exist` | 用户不存在 | 创建用户 |

### 9.2 日志分析

```bash
# 查看最近的错误日志
tail -n 100 $HOME/postgresql/data/log/postgresql-$(date +%Y-%m-%d).log | grep -i error

# 查看连接失败的日志
tail -n 100 $HOME/postgresql/data/log/postgresql-$(date +%Y-%m-%d).log | grep -i connect
```

---

## 10. 环境变量配置

为了方便使用 PostgreSQL 命令，可以将以下配置添加到 `~/.zshrc` 文件中：

```bash
# PostgreSQL 路径
export PATH=$HOME/postgresql/bin:$PATH

# PostgreSQL 数据目录
export PGDATA=$HOME/postgresql/data

# PostgreSQL 主机
export PGHOST=localhost

# PostgreSQL 端口
export PGPORT=5432

# PostgreSQL 用户
export PGUSER=postgres

# PostgreSQL 数据库
export PGDATABASE=fastapi_db
```

添加后执行 `source ~/.zshrc` 使配置生效，这样就可以直接使用 `psql`、`pg_ctl` 等命令，而不需要指定完整路径。

---

## 11. 快速参考命令

### 服务器操作
- **启动**: `pg_ctl start`
- **停止**: `pg_ctl stop`
- **重启**: `pg_ctl restart`
- **状态**: `pg_ctl status`

### 数据库操作
- **创建**: `createdb fastapi_db`
- **删除**: `dropdb fastapi_db`
- **连接**: `psql fastapi_db`

### 用户操作
- **创建**: `createuser -s postgres`
- **删除**: `dropuser postgres`
- **改密码**: `psql -c "\password postgres"`

### 备份恢复
- **备份**: `pg_dump fastapi_db > backup.sql`
- **恢复**: `psql fastapi_db < backup.sql`

### 权限管理
- **授予权限**: `psql -c "GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;"`

---

*文档更新时间：2026-04-02*