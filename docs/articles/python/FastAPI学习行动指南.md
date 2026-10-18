---
title: "FastAPI 学习行动指南"
date: "2026-04-14"
type: "技术"
tags: "Python"
note: "从基础接口、数据库到认证、测试和部署的六周行动计划。"
---

# `FastAPI` 学习行动指南

本指南将帮助你系统地学习 `FastAPI`，从基础到进阶，循序渐进。

---

## 1、第一周：`FastAPI` 基础入门

### 1.1 学习目标
掌握 `FastAPI` 的核心概念，能够创建简单的 `API` 应用。

### 1.2 任务清单

- [ ] **安装 `FastAPI` 和 Uvicorn**
  ```bash
  pip install fastapi uvicorn
  # 或使用 Poetry
  poetry add fastapi uvicorn
  ```

- [ ] **阅读 `FastAPI` 官方文档 "Tutorial - User Guide"**
  - 网址：https://fastapi.tiangolo.com/tutorial/
  - 重点章节：
    - First Steps
    - Path Parameters
    - Query Parameters
    - Request Body
    - Query Parameters and String Validations
    - Path Parameters and Numeric Validations

- [ ] **创建第一个 `FastAPI` 应用**
  - 创建 `main.py`
  - 实现基本的 GET/POST 路由
  - 运行并访问 `/docs` 查看自动文档

- [ ] **掌握路由定义和请求参数处理**
  - 路径参数：`@app.get("/items/{item_id}")`
  - 查询参数：`def read_item(q: str = None)`
  - 请求体：使用 Pydantic 模型

- [ ] **学习 Pydantic 模型定义**
  - BaseModel 基础使用
  - 字段验证（Field）
  - 嵌套模型
  - 模型继承

- [ ] **了解依赖注入系统**
  - `Depends()` 基础用法
  - 子依赖
  - 类作为依赖

### 1.3 本周产出
- 一个能运行的简单 `FastAPI` 项目
- 包含 CRUD 操作的基础 `API`

### 1.4 常见问题
- **Q: Pydantic v1 和 v2 有什么区别？**
  - A: v2 性能更好，`API` 有变化（如 `dict()` → `model_dump()`）
  
- **Q: 同步和异步路由怎么选择？**
  - A: 有 IO 操作（数据库、文件）用 async，纯计算用 sync

---

## 2、第二周：数据库与 ORM

### 2.1 学习目标
掌握使用 SQLModel 进行数据库操作，实现完整的数据持久化。

### 2.2 任务清单

- [ ] **学习 SQLModel 基础**
  - 阅读 `/FastAPI/doc/SQLModel详解.md`
  - 模型定义（`table=True`）
  - 字段类型和约束

- [ ] **数据库连接与会话管理**
  - 创建数据库引擎
  - 使用 `Session` 进行 CRUD
  - 依赖注入获取会话

- [ ] **实现完整的 CRUD `API`**
  - Create: POST 创建资源
  - Read: GET 查询（单条/列表）
  - Update: PUT/PATCH 更新
  - Delete: DELETE 删除

- [ ] **学习关系模型**
  - 一对一关系
  - 一对多关系
  - 多对多关系
  - 使用 `Relationship()` 和 `back_populates`

- [ ] **数据库迁移（Alembic）**
  - 安装：`pip install alembic`
  - 初始化：`alembic init alembic`
  - 创建迁移：`alembic revision --autogenerate`
  - 执行迁移：`alembic upgrade head`

### 2.3 本周产出
- 连接数据库的 `FastAPI` 项目
- 包含关系模型的完整 `API`
- 数据库迁移配置

### 2.4 实践项目
创建一个「博客系统」`API`：
- 用户（User）和文章（Post）一对多关系
- 文章和标签（Tag）多对多关系
- 实现完整的 CRUD

---

## 3、第三周：认证与安全

### 3.1 学习目标
掌握 `API` 安全机制，实现用户认证和权限控制。

### 3.2 任务清单

- [ ] **环境变量管理**
  - 使用 `pydantic-settings`
  - 创建 `.env` 文件
  - 区分开发/生产配置

- [ ] **密码安全**
  - 使用 `passlib` 进行密码哈希
  - bcrypt 算法
  - 验证密码

- [ ] **JWT 认证**
  - 安装：`pip install python-jose`
  - Token 生成与验证
  - 登录接口实现
  - 受保护路由

- [ ] **OAuth2 密码流程**
  - `OAuth2PasswordBearer`
  - `OAuth2PasswordRequestForm`
  - 集成 Swagger UI 认证

- [ ] **权限控制**
  - 基于角色的权限（RBAC）
  - 依赖注入实现权限检查
  - 全局异常处理

### 3.3 本周产出
- 带用户认证的 `API`
- JWT Token 机制
- 权限控制实现

### 3.4 实践项目
为第二周的博客系统添加：
- 用户注册/登录
- JWT Token 认证
- 只有作者能编辑/删除自己的文章
- 管理员可以删除任何文章

---

## 4、第四周：测试与部署

### 4.1 学习目标
掌握 `FastAPI` 测试方法，学会部署到生产环境。

### 4.2 任务清单

- [ ] **单元测试**
  - 使用 `TestClient`
  - 测试路由和响应
  - 断言状态码和数据

- [ ] **异步测试**
  - `pytest-asyncio`
  - `AsyncClient`
  - 测试异步函数

- [ ] **数据库测试**
  - 测试数据库配置
  - Fixture 使用
  - 依赖覆盖（`dependency_overrides`）

- [ ] **`Docker` 部署**
  - 编写 Dockerfile
  - docker-compose 配置
  - 多阶段构建优化

- [ ] **生产环境配置**
  - Gunicorn + Uvicorn
  - 环境变量配置
  - 日志配置

### 4.3 本周产出
- 完整的测试套件
- `Docker` 化部署配置
- 生产环境运行指南

### 4.4 实践项目
- 为博客系统编写测试（覆盖率 > 80%）
- 创建 `Docker` 部署配置
- 部署到云服务器（可选）

---

## 5、第五周：高级特性与优化

### 5.1 学习目标
掌握 `FastAPI` 高级特性，优化应用性能。

### 5.2 任务清单

- [ ] **中间件**
  - 请求日志中间件
  - CORS 配置
  - 自定义中间件

- [ ] **后台任务**
  - `BackgroundTasks`
  - 发送邮件
  - 异步处理

- [ ] **`WebSocket`**
  - 实时通信
  - ConnectionManager
  - 广播消息

- [ ] **性能优化**
  - 异步数据库查询
  - 缓存（Redis）
  - 连接池配置
  - GZip 压缩

- [ ] **`API` 版本控制**
  - `URL` 版本前缀
  - 版本化路由

### 5.3 本周产出
- 带中间件的 `API`
- `WebSocket` 实时功能
- 性能优化配置

### 5.4 实践项目
为博客系统添加：
- 请求日志记录
- `WebSocket` 实时通知（新评论提醒）
- Redis 缓存热门文章
- `API` 版本控制（v1/v2）

---

## 6、第六周：项目实战

### 6.1 学习目标
综合运用所学知识，完成一个完整的项目。

### 6.2 推荐项目

#### 项目一：任务管理系统（Todo App）
**功能需求：**
- 用户注册/登录（JWT 认证）
- 创建/编辑/删除任务
- 任务分类和标签
- 任务优先级和截止日期
- 文件附件上传
- 邮件通知（后台任务）

**技术栈：**
- `FastAPI` + SQLModel
- PostgreSQL
- Redis（缓存）
- Celery（后台任务）
- `Docker`

#### 项目二：简易电商 `API`
**功能需求：**
- 商品管理（CRUD）
- 购物车功能
- 订单系统
- 支付集成（模拟）
- 库存管理
- 用户权限（买家/卖家/管理员）

**技术栈：**
- `FastAPI` + SQLModel
- PostgreSQL
- JWT 认证
- 事务处理
- 单元测试

### 6.3 项目要求
- [ ] 完整的 `API` 文档
- [ ] 单元测试覆盖率 > 80%
- [ ] `Docker` 部署配置
- [ ] README 文档（安装、运行、`API` 说明）
- [ ] 代码规范（Black + Ruff）

---

## 7、学习资源

### 7.1 官方文档
- [`FastAPI` 官方文档](https://fastapi.tiangolo.com/)
- [Pydantic 文档](https://docs.pydantic.dev/)
- [SQLModel 文档](https://sqlmodel.tiangolo.com/)
- [Uvicorn 文档](https://www.uvicorn.org/)

### 7.2 推荐教程
- [`FastAPI` 官方教程](https://fastapi.tiangolo.com/tutorial/)
- [SQLModel 教程](https://sqlmodel.tiangolo.com/tutorial/)
- [Test-Driven Development with `FastAPI`](https://testdriven.io/courses/tdd-fastapi/)

### 7.3 参考项目
- [`FastAPI` 最佳实践示例](https://github.com/zhanymkanov/fastapi-best-practices)
- [Full Stack `FastAPI` Template](https://github.com/tiangolo/full-stack-fastapi-template)

---

## 8、学习建议

1. **循序渐进**：每周完成一个阶段，不要跳过基础
2. **多动手**：看文档不如写代码，每天至少写 1 小时
3. **做笔记**：记录遇到的问题和解决方案
4. **看源码**：`FastAPI` 源码很优秀，值得学习
5. **参与社区**：`GitHub` Issues、Discord 频道

---

## 9、问题反馈

学习过程中遇到问题：
1. 先查阅官方文档
2. 搜索 `GitHub` Issues
3. 在 Discord 频道提问
4. 随时问我！

---

*行动指南更新日期：`2026-04-14`*
