---
title: "SQLModel 详解"
date: "2026-04-14"
type: "技术"
tags: "Python"
note: "学习模型定义、会话管理、CRUD、关系模型与工程实践。"
---

# `SQLModel` 详解

`SQLModel` 是一个现代 `Python` 库，它结合了 SQLAlchemy 和 `Pydantic` 的最佳特性，为数据库操作和数据验证提供了统一的接口。本文档将详细介绍 `SQLModel` 的使用方法和最佳实践。

---

## 1、目录

1. [什么是 `SQLModel`](#_1-什么是-sqlmodel)
2. [安装与环境配置](#_2-安装与环境配置)
3. [基本概念](#_3-基本概念)
4. [模型定义](#_4-模型定义)
5. [数据库操作](#_5-数据库操作)
6. [关系模型](#_6-关系模型)
7. [高级特性](#_7-高级特性)
8. [最佳实践](#_8-最佳实践)
9. [常见问题](#_9-常见问题)

---

## 1. 什么是 `SQLModel`

`SQLModel` 是由 `FastAPI` 的创建者 Sebastián Ramírez 开发的一个 `Python` 库，它的核心思想是将 SQLAlchemy（用于数据库 ORM）和 `Pydantic`（用于数据验证）的功能结合起来，提供一个统一的接口。

### 2.1 主要特点：

- **类型提示**：完全支持 `Python` 类型提示
- **数据验证**：自动进行数据验证，确保数据完整性
- **数据库操作**：提供简洁的数据库操作 `API`
- **自动文档**：与 `FastAPI` 集成，自动生成 `API` 文档
- **代码简洁**：减少样板代码，提高开发效率

---

## 2. 安装与环境配置

### 3.1 `2.1` 安装 `SQLModel`

```bash
# 使用 pip 安装
pip install sqlmodel

# 或使用 Poetry 安装
poetry add sqlmodel

# 安装依赖项（如果需要）
pip install "sqlmodel[postgresql]"  # 包含 PostgreSQL 驱动
pip install "sqlmodel[mysql]"       # 包含 MySQL 驱动
pip install "sqlmodel[sqlite]"      # 包含 SQLite 驱动
```

### 3.2 `2.2` 环境要求

- `Python` `3.7`+
- SQLAlchemy `1.4.22`+
- `Pydantic` `2.0`+

---

## 3. 基本概念

### 4.1 `3.1` 核心组件

| 组件 | 描述 |
|------|------|
| `SQLModel` | 基础模型类，继承自 `Pydantic` 的 BaseModel |
| `Field` | 用于定义字段属性的工具 |
| `create_engine` | 创建数据库引擎 |
| `Session` | 数据库会话，用于执行数据库操作 |
| `select` | 用于构建 SELECT 查询 |

### 4.2 `3.2` 工作原理

`SQLModel` 的工作原理是：
1. 定义继承自 `SQLModel` 的模型类
2. 模型类同时作为 `Pydantic` 模型和 SQLAlchemy 模型
3. 使用 `create_engine` 创建数据库引擎
4. 使用 `Session` 执行数据库操作
5. 自动处理数据验证和类型转换

---

## 4. 模型定义

### 5.1 `4.1` 基础模型

```python
from sqlmodel import SQLModel, Field
from typing import Optional

class Hero(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    secret_name: str
    age: Optional[int] = None
```

### 5.2 `4.2` 字段配置

```python
class Item(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    price: float = Field(..., gt=0)
    is_available: bool = Field(default=True)
```

### 5.3 `4.3` 模型继承

```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

# 基础模型（不创建表，作为混入类使用）
class TimestampMixin(SQLModel):
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

# 数据库模型继承 TimestampMixin
class User(TimestampMixin, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
```

---

## 5. 数据库操作

### 6.1 `5.1` 创建数据库表

```python
from sqlmodel import SQLModel, create_engine

# 创建数据库引擎
DATABASE_URL = "postgresql://postgres:postgres@localhost/fastapi_db"
engine = create_engine(DATABASE_URL, echo=True)

# 创建所有表
SQLModel.metadata.create_all(engine)
```

### 6.2 `5.2` 会话管理

```python
from sqlmodel import Session

# 创建会话
with Session(engine) as session:
    # 执行数据库操作
    pass

# 或使用依赖注入（FastAPI）
def get_session():
    with Session(engine) as session:
        yield session
```

### 6.3 `5.3` CRUD 操作

#### 创建（Create）

```python
from sqlmodel import Session

# 使用上下文管理器管理会话
with Session(engine) as session:
    hero = Hero(name="Spider-Man", secret_name="Peter Parker", age=20)
    session.add(hero)
    session.commit()
    session.refresh(hero)  # 刷新对象，获取生成的 ID
    print(f"Created hero with ID: {hero.id}")
```

#### 读取（Read）

```python
from sqlmodel import Session, select

with Session(engine) as session:
    # 查询单个对象（通过主键）
    hero = session.get(Hero, 1)
    
    # 查询多个对象（带条件）
    statement = select(Hero).where(Hero.age > 18)
    heroes = session.exec(statement).all()
    
    # 带排序和分页
    statement = select(Hero).order_by(Hero.name).offset(0).limit(10)
    heroes = session.exec(statement).all()
    
    # 查询单个对象（带条件）
    statement = select(Hero).where(Hero.name == "Spider-Man")
    hero = session.exec(statement).first()
```

#### 更新（Update）

```python
from sqlmodel import Session

with Session(engine) as session:
    # 获取要更新的对象
    hero = session.get(Hero, 1)
    if hero:
        hero.age = 21
        session.add(hero)
        session.commit()
        session.refresh(hero)
        print(f"Updated hero: {hero}")
```

#### 删除（Delete）

```python
from sqlmodel import Session

with Session(engine) as session:
    # 获取要删除的对象
    hero = session.get(Hero, 1)
    if hero:
        session.delete(hero)
        session.commit()
        print(f"Deleted hero: {hero.name}")
```

---

## 6. 关系模型

### 7.1 `6.1` 一对一关系

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    # 使用 Relationship 定义关系，back_populates 实现双向关联
    profile: Optional["UserProfile"] = Relationship(back_populates="user")

class UserProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    bio: str
    avatar: str
    # 反向关系
    user: Optional[User] = Relationship(back_populates="profile")

# SQLModel 0.0.14+ 使用 model_rebuild() 解析前向引用
User.model_rebuild()
UserProfile.model_rebuild()
```

### 7.2 `6.2` 一对多关系

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class Team(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    # 一对多关系：一个 Team 有多个 Hero
    heroes: List["Hero"] = Relationship(back_populates="team")

class Hero(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    team_id: Optional[int] = Field(default=None, foreign_key="team.id")
    # 多对一关系：多个 Hero 属于一个 Team
    team: Optional[Team] = Relationship(back_populates="heroes")

# SQLModel 0.0.14+ 使用 model_rebuild() 解析前向引用
Team.model_rebuild()
Hero.model_rebuild()
```

### 7.3 `6.3` 多对多关系

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

# 关联表（中间表）
class HeroTeamLink(SQLModel, table=True):
    hero_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="hero.id")
    team_id: Optional[int] = Field(default=None, primary_key=True, foreign_key="team.id")

class Hero(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    # 多对多关系：一个 Hero 可以属于多个 Team
    teams: List["Team"] = Relationship(back_populates="heroes", link_model=HeroTeamLink)

class Team(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    # 多对多关系：一个 Team 可以有多个 Hero
    heroes: List[Hero] = Relationship(back_populates="teams", link_model=HeroTeamLink)

# SQLModel 0.0.14+ 使用 model_rebuild() 解析前向引用
Hero.model_rebuild()
Team.model_rebuild()
```

---

## 7. 高级特性

### 8.1 `7.1` 联合模型

```python
from sqlmodel import SQLModel, Field
from typing import Optional

# 基础模型（不创建表，作为基类使用）
class HeroBase(SQLModel):
    name: str
    secret_name: str
    age: Optional[int] = None

# 创建模型（用于 API 请求验证）
class HeroCreate(HeroBase):
    pass

# 更新模型（所有字段可选，用于 PATCH 请求）
class HeroUpdate(SQLModel):
    name: Optional[str] = None
    secret_name: Optional[str] = None
    age: Optional[int] = None

# 数据库模型（继承 HeroBase 并创建表）
class Hero(HeroBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

# 响应模型（用于 API 响应，可包含额外字段）
class HeroResponse(HeroBase):
    id: int
```

### 8.2 `7.2` 事务管理

```python
from sqlmodel import Session
from sqlalchemy.exc import SQLAlchemyError

try:
    with Session(engine) as session:
        with session.begin():
            # 执行多个操作
            hero1 = Hero(name="Iron Man", secret_name="Tony Stark")
            hero2 = Hero(name="Captain America", secret_name="Steve Rogers")
            session.add(hero1)
            session.add(hero2)
            # session.begin() 上下文管理器会自动提交或回滚
except SQLAlchemyError as e:
    print(f"数据库错误: {e}")
    # 发生异常时自动回滚，无需手动处理
```

### 8.3 `7.3` 批量操作

```python
from sqlmodel import Session, select

# 批量插入
heroes = [
    Hero(name="Spider-Man", secret_name="Peter Parker"),
    Hero(name="Thor", secret_name="Thor Odinson"),
    Hero(name="Hulk", secret_name="Bruce Banner")
]

with Session(engine) as session:
    session.add_all(heroes)
    session.commit()
    # 刷新获取生成的 ID
    for hero in heroes:
        session.refresh(hero)

# 批量更新（使用 execute 进行批量更新更高效）
from sqlalchemy import update

with Session(engine) as session:
    # 方式1：查询后逐个更新
    statement = select(Hero).where(Hero.age.is_(None))
    heroes = session.exec(statement).all()
    for hero in heroes:
        hero.age = 30
    session.add_all(heroes)
    session.commit()
    
    # 方式2：使用 SQLAlchemy 的 update 进行批量更新（更高效）
    statement = update(Hero).where(Hero.age.is_(None)).values(age=30)
    session.exec(statement)
    session.commit()
```

---

## 8. 最佳实践

### 9.1 `8.1` 项目结构

```
app/
├── models/              # 数据库模型
│   ├── __init__.py
│   ├── user.py
│   └── item.py
├── schemas/             # 数据传输模型
│   ├── __init__.py
│   ├── user.py
│   └── item.py
├── core/
│   ├── __init__.py
│   ├── config.py        # 配置
│   └── database.py      # 数据库连接
└── routers/
    ├── __init__.py
    ├── users.py
    └── items.py
```

### 9.2 `8.2` 配置管理

```python
# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost/fastapi_db"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()

# core/database.py
from sqlmodel import SQLModel, create_engine
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
```

### 9.3 `8.3` 依赖注入

```python
# 为 FastAPI 提供数据库会话
def get_session():
    with Session(engine) as session:
        yield session

# 在路由中使用
@app.post("/heroes/")
def create_hero(hero: HeroCreate, session: Session = Depends(get_session)):
    db_hero = Hero.model_validate(hero)
    session.add(db_hero)
    session.commit()
    session.refresh(db_hero)
    return db_hero
```

### 9.4 `8.4` 错误处理

```python
from fastapi import FastAPI, HTTPException, status, Depends
from sqlmodel import Session

app = FastAPI()

@app.get("/heroes/{hero_id}")
def get_hero(hero_id: int, session: Session = Depends(get_session)):
    hero = session.get(Hero, hero_id)
    if not hero:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hero with id {hero_id} not found"
        )
    return hero

# 全局异常处理（可选）
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()}
    )
```

---

## 9. 常见问题

### 10.1 `9.1` 表未创建

**问题**：运行时提示表不存在

**解决方案**：
- 确保调用了 `SQLModel.metadata.create_all(engine)`
- 检查模型是否设置了 `table=True`
- 检查数据库连接是否正确

### 10.2 `9.2` 关系模型错误

**问题**：关系模型引用错误

**解决方案**：
- `SQLModel` `0.0.14`+ 使用 `model_rebuild()` 解析前向引用（旧版本使用 `update_forward_refs()`）
- 确保外键引用正确
- 检查关系定义是否匹配
- 确保使用了 `Relationship()` 来定义关系，而不是简单的类型注解

### 10.3 `9.3` 数据验证错误

**问题**：数据验证失败

**解决方案**：
- 检查字段类型是否正确
- 确保必填字段有值
- 检查字段约束是否满足

### 10.4 `9.4` 性能问题

**问题**：查询速度慢

**解决方案**：
- 使用索引：`Field(index=True)`
- 优化查询语句，只查询需要的字段
- 避免 N+1 查询问题，使用 `selectinload` 预加载关系
- 使用适当的分页：`offset()` 和 `limit()`
- 对于大量数据，使用批量操作而非逐个处理

```python
# 添加索引示例
class Hero(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)  # 为 name 字段添加索引
    age: Optional[int] = Field(default=None, index=True)

# 避免 N+1 查询，使用预加载
from sqlalchemy.orm import selectinload

statement = select(Hero).options(selectinload(Hero.teams))
heroes = session.exec(statement).all()
```

---

## 10. 代码示例

### 11.1 完整的 `FastAPI` + `SQLModel` 示例

```python
from fastapi import FastAPI, Depends, HTTPException, status
from sqlmodel import SQLModel, Field, create_engine, Session, select
from typing import Optional, List
from contextlib import asynccontextmanager

# ========== 配置 ==========
DATABASE_URL = "sqlite:///./database.db"  # 开发环境使用 SQLite
# DATABASE_URL = "postgresql://postgres:postgres@localhost/fastapi_db"  # 生产环境使用 PostgreSQL

engine = create_engine(
    DATABASE_URL,
    echo=True,  # 打印 SQL 语句，方便调试
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# ========== 模型定义 ==========
# 基础模型
class HeroBase(SQLModel):
    name: str = Field(..., min_length=1, max_length=100)
    secret_name: str
    age: Optional[int] = Field(default=None, ge=0, le=150)

# 创建请求模型
class HeroCreate(HeroBase):
    pass

# 更新请求模型
class HeroUpdate(SQLModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    secret_name: Optional[str] = None
    age: Optional[int] = Field(default=None, ge=0, le=150)

# 数据库模型
class Hero(HeroBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

# 响应模型
class HeroResponse(HeroBase):
    id: int

# ========== 数据库生命周期管理 ==========
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时创建表
    SQLModel.metadata.create_all(engine)
    yield
    # 关闭时可以执行清理操作

# ========== FastAPI 应用 ==========
app = FastAPI(
    title="Hero API",
    description="使用 FastAPI 和 SQLModel 构建的英雄管理 API",
    version="1.0.0",
    lifespan=lifespan
)

# 依赖项：获取数据库会话
def get_session():
    with Session(engine) as session:
        yield session

# ========== API 路由 ==========

@app.post("/heroes/", response_model=HeroResponse, status_code=status.HTTP_201_CREATED)
def create_hero(hero: HeroCreate, session: Session = Depends(get_session)):
    """创建新英雄"""
    db_hero = Hero.model_validate(hero)
    session.add(db_hero)
    session.commit()
    session.refresh(db_hero)
    return db_hero

@app.get("/heroes/", response_model=List[HeroResponse])
def read_heroes(
    offset: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """获取英雄列表（支持分页）"""
    statement = select(Hero).offset(offset).limit(limit)
    heroes = session.exec(statement).all()
    return heroes

@app.get("/heroes/{hero_id}", response_model=HeroResponse)
def read_hero(hero_id: int, session: Session = Depends(get_session)):
    """根据 ID 获取单个英雄"""
    hero = session.get(Hero, hero_id)
    if not hero:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hero with id {hero_id} not found"
        )
    return hero

@app.patch("/heroes/{hero_id}", response_model=HeroResponse)
def update_hero(
    hero_id: int,
    hero_update: HeroUpdate,
    session: Session = Depends(get_session)
):
    """更新英雄信息（部分更新）"""
    db_hero = session.get(Hero, hero_id)
    if not db_hero:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hero with id {hero_id} not found"
        )
    
    # 只更新提供的字段
    hero_data = hero_update.model_dump(exclude_unset=True)
    for key, value in hero_data.items():
        setattr(db_hero, key, value)
    
    session.add(db_hero)
    session.commit()
    session.refresh(db_hero)
    return db_hero

@app.delete("/heroes/{hero_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hero(hero_id: int, session: Session = Depends(get_session)):
    """删除英雄"""
    hero = session.get(Hero, hero_id)
    if not hero:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hero with id {hero_id} not found"
        )
    session.delete(hero)
    session.commit()
    return None

# ========== 运行应用 ==========
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 11. 总结

`SQLModel` 是一个强大的库，它结合了 SQLAlchemy 和 `Pydantic` 的最佳特性，为 `Python` 开发者提供了一种简洁、类型安全的方式来处理数据库操作。通过本文档的介绍，你应该已经了解了 `SQLModel` 的基本概念、使用方法和最佳实践。

### 12.1 核心优势：

1. **类型安全**：完全支持 `Python` 类型提示
2. **数据验证**：自动进行数据验证
3. **代码简洁**：减少样板代码
4. **易于集成**：与 `FastAPI` 无缝集成
5. **功能强大**：支持复杂的数据库操作和关系

`SQLModel` 是构建现代 `Python` 应用的理想选择，特别是当你需要同时处理数据库操作和数据验证时。

---

*文档更新时间：`2026-04-02`*