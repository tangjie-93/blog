---
title: "Pydantic 详解"
date: "2026-04-14"
type: "技术"
tags: "Python"
note: "学习类型验证、字段系统、模型配置、序列化与版本迁移。"
---

# Pydantic 详解

> Pydantic 是现代 `Python` 开发中最重要的数据验证库之一，它利用类型注解来实现数据验证、序列化和文档生成。本文档将详细介绍 Pydantic 的各个方面，帮助你从入门到精通。

## 1、目录

1. [什么是 Pydantic](#_1-什么是-pydantic)
2. [核心概念与基础模型](#_2-核心概念与基础模型)
3. [数据验证详解](#_3-数据验证详解)
4. [字段类型系统](#_4-字段类型系统)
5. [配置选项](#_5-配置选项)
6. [高级特性](#_6-高级特性)
7. [与 `FastAPI` 集成](#_7-与-fastapi-集成)
8. [最佳实践与项目结构](#_8-最佳实践与项目结构)
9. [版本差异与迁移](#_9-版本差异与迁移)

---

## 1. 什么是 Pydantic

### 2.1 `1.1` Pydantic 简介

Pydantic 是一个基于 `Python` 类型注解的数据验证库，它的核心思想是：**"用 `Python` 的类型注解来定义数据结构，然后自动验证这些数据是否符合定义"**。

在传统编程中，我们通常需要手动编写大量验证代码：

```python
# 传统方式：手动验证
def create_user(data):
    # 逐个检查每个字段
    if 'name' not in data:
        raise ValueError("name 是必填字段")
    if not isinstance(data['name'], str):
        raise ValueError("name 必须是字符串")
    if len(data['name']) < 2:
        raise ValueError("name 至少需要2个字符")
    
    if 'age' not in data:
        raise ValueError("age 是必填字段")
    if not isinstance(data['age'], int):
        raise ValueError("age 必须是整数")
    
    # ... 更多验证
    return data
```

使用 Pydantic 后，同样的验证只需要定义模型类：

```python
# Pydantic 方式：声明式定义
from pydantic import BaseModel

class User(BaseModel):
    name: str  # 自动验证：必填、字符串类型
    age: int   # 自动验证：必填、整数类型
```

### 2.2 `1.2` 主要特点详解

**（1）基于类型注解**

Pydantic 利用 `Python` `3.6`+ 引入的类型提示（Type Hints）系统。这意味着你可以用熟悉的 `Python` 类型语法来定义数据结构：

```python
from pydantic import BaseModel
from typing import Optional, List

class User(BaseModel):
    name: str              # 字符串
    age: int               # 整数
    email: Optional[str] = None  # 可选字符串，有默认值
    tags: List[str] = []   # 字符串列表
```

**（2）自动验证**

当你创建 Pydantic 模型实例时，它会自动验证传入的数据：

```python
# 有效数据 - 验证通过
user = User(name="张三", age=25)
print(user)  # name='张三' age=25

# 无效数据 - 自动抛出详细错误
try:
    user = User(name="张三", age="25岁")  # age 应该是 int，不是字符串
except Exception as e:
    print(e)
    """
    ValidationError: 1 validation error for User
    age
      Input should be a valid integer [type=int_type, input_value='25岁', input_type=str]
    """
```

**（3）性能优秀（Pydantic V2）**

Pydantic V2 使用 Rust 编写的核心验证逻辑（pydantic-core），性能比 V1 提升了 5-50 倍。这对于高流量的 `API` 服务非常重要。

**（4）友好的错误提示**

当验证失败时，Pydantic 会提供清晰的错误信息，包括：
- 哪个字段验证失败
- 期望的类型是什么
- 实际传入的值是什么

```python
from pydantic import BaseModel, EmailStr

class User(BaseModel):
    name: str
    email: EmailStr

try:
    User(name="张三", email="invalid-email")
except Exception as e:
    print(e)
    """
    1 validation error for User
    email
      value is not a valid email address [type=email_parsing, input_value='invalid-email', input_type=str]
    """
```

**（5）`JSON` Schema 支持**

Pydantic 可以自动生成 `JSON` Schema，这对于 `API` 文档生成（如 Swagger/OpenAPI）非常有用：

```python
class User(BaseModel):
    name: str
    age: int
    email: str

# 生成 JSON Schema
schema = User.model_json_schema()
print(schema)
"""
{
    'type': 'object', 
    'properties': {
        'name': {'type': 'string'}, 
        'age': {'type': 'integer'}, 
        'email': {'type': 'string'}
    }, 
    'required': ['name', 'age', 'email']
}
"""
```

### 2.3 `1.3` Pydantic 的应用场景

| 场景 | 说明 | 示例 |
|------|------|------|
| `API` 请求验证 | 验证客户端传入的数据 | `FastAPI` 请求体验证 |
| `API` 响应格式化 | 统一 `API` 返回格式 | 序列化数据库对象 |
| 配置管理 | 类型安全的应用配置 | 环境变量、配置文件 |
| 数据转换 | 不同格式间安全转换 | `JSON` ↔ `Python` 对象 |
| 数据清洗 | 标准化输入数据 | 去除空格、类型转换 |

---

## 2. 核心概念与基础模型

### 3.1 `2.1` BaseModel 简介

`BaseModel` 是 Pydantic 的核心类，所有的数据模型都继承自它。当你定义一个继承自 `BaseModel` 的类时，Pydantic 会自动：

1. **扫描类型注解**：读取类中所有带类型注解的属性
2. **生成验证器**：为每个属性生成对应的验证逻辑
3. **创建元数据**：存储字段的描述信息（用于文档生成）

```python
from pydantic import BaseModel

# 最简单的模型定义
class User(BaseModel):
    name: str
    age: int
    email: str

# 解释：
# - User 继承自 BaseModel
# - name, age, email 是模型的三个字段
# - 每个字段都有明确的类型注解
# - Pydantic 会自动为这些字段生成验证逻辑
```

### 3.2 `2.2` 模型实例化的多种方式

Pydantic 支持多种方式创建模型实例：

**方式一：直接传入关键字参数（最常用）**

```python
user = User(name="张三", age=25, email="zhangsan@example.com")
print(user.name)  # 张三
print(user.age)    # 25

# 解释：
# - 直接使用关键字参数创建实例
# - Pydantic 会立即进行验证
# - 验证通过后，对象就可以使用了
```

**方式二：从字典创建（`model_validate`）**

```python
# 从字典创建
data = {"name": "张三", "age": 25, "email": "zhangsan@example.com"}
user = User.model_validate(data)

# 解释：
# - model_validate 是 V2 的方法（V1 用 parse_obj）
# - 适合处理已经存在的字典数据
# - 返回一个 User 实例
```

**方式三：从 `JSON` 字符串创建（`model_validate_json`）**

```python
# 从 JSON 字符串创建
json_str = '{"name": "张三", "age": 25, "email": "zhangsan@example.com"}'
user = User.model_validate_json(json_str)

# 解释：
# - model_validate_json 直接接受 JSON 字符串
# - 内部会先解析 JSON 为字典，再验证
# - 比 model_validate 多一步 JSON 解析
# - 适合处理 API 请求中的 JSON body
```

**方式四：从 ORM 对象创建**

```python
# 假设有一个数据库模型 UserModel
class UserModel:
    def __init__(self):
        self.name = "张三"
        self.age = 25
        self.email = "zhangsan@example.com"

# 从 ORM 对象创建（Pydantic V2）
orm_object = UserModel()
user = User.model_validate(orm_object)

# 解释：
# - Pydantic 可以从对象属性中提取数据
# - 需要配置 from_attributes = True（V2 默认支持）
# - 适合将数据库对象转换为 API 响应模型
```

### 3.3 `2.3` 深入理解模型验证流程

当你创建一个 Pydantic 模型实例时，背后发生了什么？

```python
from pydantic import BaseModel, field_validator
from datetime import datetime

class User(BaseModel):
    name: str
    age: int
    created_at: datetime = None  # 有默认值，可以不传

# 执行流程（理解即可，无需手动操作）：
# 1. 接收原始数据 {"name": "张三", "age": 25}
# 2. 检查必填字段（name, age）- 如果缺失，抛出错误
# 3. 检查字段类型 - name 应该是 str，age 应该是 int
# 4. 执行自定义验证器（如果有）
# 5. 应用默认值 - created_at 没有传入，使用 None
# 6. 创建模型实例
# 7. 返回实例
```

### 3.4 `2.4` 序列化：模型转字典/`JSON`

Pydantic 不仅能验证输入，还能将模型转换为字典或 `JSON`：

**转换为字典（`model_dump`）**

```python
user = User(name="张三", age=25, email="zhangsan@example.com")

# 转换为字典
user_dict = user.model_dump()
print(user_dict)
# {'name': '张三', 'age': 25, 'email': 'zhangsan@example.com', 'created_at': None}

# 解释：
# - model_dump() 返回一个 Python 字典
# - 包含模型的所有字段（包括默认值）
```

**转换为 `JSON` 字符串（`model_dump_json`）**

```python
# 转换为 JSON 字符串
user_json = user.model_dump_json()
print(user_json)
# {"name":"张三","age":25,"email":"zhangsan@example.com","created_at":null}

# 解释：
# - model_dump_json() 返回 JSON 字符串
# - 可以直接用于 HTTP 响应
```

**选择性地序列化（include/exclude）**

```python
# 只包含特定字段
user_dict = user.model_dump(include={"name", "email"})
# {'name': '张三', 'email': 'zhangsan@example.com'}

# 排除特定字段（常用于密码等敏感信息）
user_dict = user.model_dump(exclude={"password", "created_at"})

# 解释：
# - include: 只导出指定的字段
# - exclude: 排除指定的字段
# - 两个参数可以组合使用
```

**嵌套模型的序列化**

```python
from pydantic import BaseModel
from typing import Optional

class Address(BaseModel):
    city: str
    street: str
    zipcode: str

class User(BaseModel):
    name: str
    address: Optional[Address] = None

user = User(
    name="张三",
    address=Address(city="北京", street="长安街", zipcode="100000")
)

# 序列化时，嵌套模型会被递归转换
print(user.model_dump())
"""
{
    'name': '张三',
    'address': {
        'city': '北京',
        'street': '长安街', 
        'zipcode': '100000'
    }
}
"""
```

---

## 3. 数据验证详解

### 4.1 `3.1` 验证器概述

Pydantic 提供了多种验证器来满足不同的验证需求：

| 验证器类型 | 说明 | 使用场景 |
|------------|------|----------|
| `field_validator` | 单字段验证 | 验证单个字段的格式、范围等 |
| `model_validator` | 模型级验证 | 验证多个字段之间的关系 |
| `Field` | 字段配置 | 定义字段的约束条件 |

### 4.2 `3.2` 字段验证器（field_validator）

字段验证器用于验证单个字段的值。

**基本语法**

```python
from pydantic import BaseModel, field_validator

class User(BaseModel):
    name: str
    age: int

    @field_validator('name')  # 要验证的字段名
    @classmethod
    def validate_name(cls, v: str) -> str:
        # v 是字段的原始值
        # 可以在这里添加验证逻辑
        # 返回处理后的值
        return v

# 解释：
# 1. @field_validator('name') - 指定要验证的字段
# 2. @classmethod - 必须是类方法
# 3. 第一个参数 cls - 类本身
# 4. 第二个参数 v - 字段的值
# 5. 返回值会替换原来的值
```

**实战示例：姓名验证**

```python
from pydantic import BaseModel, field_validator

class User(BaseModel):
    name: str
    age: int

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        # 验证：姓名至少需要2个字符
        if len(v) < 2:
            raise ValueError('姓名至少需要 2 个字符')
        
        # 验证通过，将姓名首字母大写
        return v.title()

# 测试
user = User(name="zhang san", age=25)
print(user.name)  # Zhang San（首字母大写）

# 验证失败
try:
    User(name="张", age=25)
except Exception as e:
    print(e)  # 姓名至少需要 2 个字符
```

**实战示例：年龄验证**

```python
from pydantic import BaseModel, field_validator

class User(BaseModel):
    name: str
    age: int

    @field_validator('age')
    @classmethod
    def validate_age(cls, v: int) -> int:
        # 验证：年龄必须在 0-150 之间
        if v < 0 or v > 150:
            raise ValueError('年龄必须在 0-150 之间')
        
        # 验证通过，返回原值
        return v

# 测试
user = User(name="张三", age=25)  # 正常
try:
    User(name="张三", age=-1)  # 抛出异常
except Exception as e:
    print(e)  # 年龄必须在 0-150 之间
```

**实战示例：密码强度验证**

```python
from pydantic import BaseModel, field_validator

class User(BaseModel):
    name: str
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        # 验证密码强度
        if len(v) < 8:
            raise ValueError('密码至少需要 8 个字符')
        
        # 检查是否包含数字
        if not any(c.isdigit() for c in v):
            raise ValueError('密码必须包含至少一个数字')
        
        # 检查是否包含字母
        if not any(c.isalpha() for c in v):
            raise ValueError('密码必须包含至少一个字母')
        
        return v

# 测试
try:
    User(name="张三", password="123456")  # 失败：没有字母
except Exception as e:
    print(e)

try:
    User(name="张三", password="abcdef")  # 失败：不足8位
except Exception as e:
    print(e)

user = User(name="张三", password="abc12345")  # 成功
```

**验证多个字段**

你可以为同一个模型添加多个字段验证器：

```python
from pydantic import BaseModel, field_validator

class User(BaseModel):
    name: str
    age: int
    password: str

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v) < 2:
            raise ValueError('姓名至少需要 2 个字符')
        return v.title()

    @field_validator('age')
    @classmethod
    def validate_age(cls, v: int) -> int:
        if v < 0 or v > 150:
            raise ValueError('年龄必须在 0-150 之间')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('密码至少需要 8 个字符')
        return v

# 解释：
# - 每个 @field_validator 装饰一个方法
# - 可以验证不同的字段
# - 验证顺序不确定（不要依赖执行顺序）
```

**使用 `mode` 参数**

`field_validator` 有 `mode` 参数，控制验证的时机：

```python
from pydantic import BaseModel, field_validator

class User(BaseModel):
    name: str

    @field_validator('name', mode='before')
    @classmethod
    def preprocess_name(cls, v):
        # mode='before': 在类型转换之前验证
        # 适合做预处理，比如去除空格、转换类型
        if isinstance(v, str):
            return v.strip()  # 去除首尾空格
        return v

    @field_validator('name', mode='after')
    @classmethod
    def validate_name(cls, v):
        # mode='after': 在类型转换之后验证（默认）
        # 适合做业务验证
        if len(v) < 2:
            raise ValueError('姓名至少需要 2 个字符')
        return v

# 解释：
# - mode='before': 在 Pydantic 进行类型检查之前执行
#   适合做数据预处理，比如去除空格、转换格式
# - mode='after': 在 Pydantic 完成类型检查之后执行（默认）
#   适合做业务逻辑验证
```

### 4.3 `3.3` 模型验证器（model_validator）

模型验证器用于验证多个字段之间的关系，或者进行跨字段的验证。

**基本语法**

```python
from pydantic import BaseModel, model_validator

class User(BaseModel):
    password: str
    confirm_password: str

    @model_validator(mode='after')  # mode='after' 在所有字段验证之后
    def check_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError('两次输入的密码不一致')
        return self

# 解释：
# - model_validator 用于验证多个字段之间的关系
# - mode='after': 所有字段验证完成后执行
# - self 是模型实例，可以访问所有字段
# - 必须返回 self（或其他有效的模型实例）
```

**实战示例：密码确认验证**

```python
from pydantic import BaseModel, model_validator

class RegisterForm(BaseModel):
    username: str
    password: str
    confirm_password: str

    @model_validator(mode='after')
    def validate_passwords(self):
        if self.password != self.confirm_password:
            raise ValueError('两次输入的密码不一致')
        
        # 还可以做其他验证
        if len(self.password) < 8:
            raise ValueError('密码长度至少8位')
        
        return self

# 测试
form = RegisterForm(
    username="zhangsan",
    password="12345678",
    confirm_password="12345678"
)  # 成功

try:
    RegisterForm(
        username="zhangsan",
        password="12345678",
        confirm_password="12345679"  # 密码不一致
    )
except Exception as e:
    print(e)  # 两次输入的密码不一致
```

**使用 mode='before' 进行预处理**

```python
from pydantic import BaseModel, model_validator

class User(BaseModel):
    name: str
    age: int

    @model_validator(mode='before')
    @classmethod
    def preprocess(cls, data):
        # mode='before': 在任何验证之前执行
        # 可以在这里做数据预处理
        if isinstance(data, dict):
            # 确保 name 是字符串
            if 'name' in data and not isinstance(data['name'], str):
                data['name'] = str(data['name'])
        return data

# 解释：
# - mode='before': 在字段验证之前执行
# - 接收原始数据（字典或模型实例）
# - 可以修改或补充数据
# - 返回修改后的数据或新的数据
```

### 4.4 `3.4` Field 详解

`Field` 是 Pydantic 提供的字段配置工具，用于定义字段的约束条件和元数据。

**基本语法**

```python
from pydantic import BaseModel, Field
from typing import Optional

class Product(BaseModel):
    name: str = Field(
        ...,  # ... 表示必填（相当于 default=...）
        min_length=1,
        max_length=100,
        description="产品名称"
    )
    price: float = Field(
        ...,  # 必填
        gt=0,  # greater than，大于 0
        description="产品价格，必须大于 0"
    )
    quantity: int = Field(
        default=0,  # 默认值为 0
        ge=0,       # greater than or equal，大于等于 0
        description="库存数量"
    )

# 解释：
# Field 的参数：
# - ...（省略号）：表示必填字段，不能省略
# - default: 默认值（如果可选）
# - description: 字段描述（用于文档生成）
# - min_length/max_length: 字符串长度限制
# - gt/gelt: 数值大小限制（greater than, greater than or equal）
# - lt/lte: 数值大小限制（less than, less than or equal）
```

**常用 Field 参数一览**

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `default` | 任意 | 默认值 | `default=0` |
| `default_factory` | 函数 | 默认值工厂 | `default_factory=list` |
| `description` | str | 字段描述 | `description="用户名"` |
| `min_length` | int | 最小长度 | `min_length=2` |
| `max_length` | int | 最大长度 | `max_length=50` |
| `gt` | float | 大于 | `gt=0` |
| `ge` | float | 大于等于 | `ge=0` |
| `lt` | float | 小于 | `lt=100` |
| `le` | float | 小于等于 | `le=100` |
| `pattern` | str | 正则表达式 | `pattern=r'^[A-Z]{2}-\d{4}$'` |
| `alias` | str | 字段别名 | `alias='userName'` |
| `title` | str | 字段标题 | `title='User Name'` |

**实战示例：产品 SKU 验证**

```python
from pydantic import BaseModel, Field

class Product(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0, description="产品价格")
    quantity: int = Field(default=0, ge=0)
    sku: str = Field(
        ..., 
        pattern=r'^[A-Z]{2}-\d{4}$',  # SKU 格式：XX-0000
        description="产品 SKU，格式：XX-0000"
    )

# 测试
product = Product(
    name="iPhone 15",
    price=6999.0,
    quantity=100,
    sku="IP-2024"
)
print(product.sku)  # IP-2024

# SKU 格式错误
try:
    Product(
        name="iPhone 15",
        price=6999.0,
        quantity=100,
        sku="iphone-2024"  # 小写字母，不符合格式
    )
except Exception as e:
    print(e)
    """
    1 validation error for Product
    sku
      String should match pattern '^[A-Z]{2}-\d{4}$' 
      [type=string_pattern_matched, input_value='iphone-2024', input_type=str]
    """
```

**实战示例：带别名的字段**

```python
from pydantic import BaseModel, Field

class User(BaseModel):
    name: str = Field(alias='userName')
    age: int = Field(alias='userAge')
    email: str = Field(alias='userEmail')

# 使用别名创建实例
user = User.model_validate({
    'userName': '张三',
    'userAge': 25,
    'userEmail': 'zhangsan@example.com'
})

print(user.name)  # 张三
print(user.model_dump(by_alias=True))
# {'userName': '张三', 'userAge': 25, 'userEmail': 'zhangsan@example.com'}

# 解释：
# - alias: 允许使用别名来传递数据
# - model_dump(by_alias=True): 序列化时使用别名
# - 适合处理前后端字段名不一致的情况
```

**实战示例：使用 default_factory**

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List

class Order(BaseModel):
    order_id: str
    created_at: datetime = Field(default_factory=datetime.now)
    tags: List[str] = Field(default_factory=list)
    items: List[str] = Field(default_factory=lambda: [])

# 解释：
# - default_factory: 接收一个可调用对象（函数或lambda）
# - 每次创建实例时调用，生成默认值
# - 适合需要动态计算默认值的场景

order = Order(order_id="ORDER-001")
print(order.created_at)  # 2024-01-15 10:30:00（当前时间）
print(order.tags)         # []
print(order.items)        # []
```

### 4.5 `3.5` 验证器的执行顺序

理解验证器的执行顺序很重要：

```
1. model_validator (mode='before')
        ↓
2. 字段类型检查（如 str -> int）
        ↓
3. Field 约束检查（如 min_length, gt）
        ↓
4. field_validator (mode='before')
        ↓
5. field_validator (mode='after')  
        ↓
6. model_validator (mode='after')
```

```python
from pydantic import BaseModel, field_validator, model_validator

class User(BaseModel):
    age: int

    @field_validator('age', mode='before')
    def preprocess_age(cls, v):
        print("1. field_validator before")
        return v

    @field_validator('age', mode='after')
    def validate_age(cls, v):
        print("3. field_validator after")
        return v

    @model_validator(mode='before')
    @classmethod
    def preprocess_model(cls, data):
        print("0. model_validator before")
        return data

    @model_validator(mode='after')
    def validate_model(self):
        print("4. model_validator after")
        return self

# 测试
user = User(age=25)
# 输出顺序：
# 0. model_validator before
# 1. field_validator before  
# 3. field_validator after
# 4. model_validator after
```

---

## 4. 字段类型系统

### 5.1 `4.1` 标准 `Python` 类型

Pydantic 支持所有标准 `Python` 类型作为字段类型：

```python
from pydantic import BaseModel
from typing import Optional, List, Dict, Set, Tuple
from datetime import datetime, date, time
from decimal import Decimal
from uuid import UUID
from enum import Enum

class StandardTypesExample(BaseModel):
    # ========== 基本类型 ==========
    string_field: str        # 字符串
    int_field: int           # 整数
    float_field: float       # 浮点数
    bool_field: bool         # 布尔值

    # ========== 可选类型 ==========
    optional_field: Optional[str] = None  # 可选字符串，等同于 str | None

    # ========== 集合类型 ==========
    list_field: List[int]          # 整数列表
    dict_field: Dict[str, int]     # 字典：键为字符串，值为整数
    set_field: Set[str]            # 字符串集合（去重）
    tuple_field: Tuple[int, str, float]  # 元组：固定长度和类型

    # ========== 特殊类型 ==========
    decimal_field: Decimal    # 高精度小数
    uuid_field: UUID          # UUID
    datetime_field: datetime  # 日期时间
    date_field: date          # 日期
    time_field: time          # 时间

# 解释：
# - str: 字符串类型
# - int: 整数类型（自动验证）
# - float: 浮点数类型
# - bool: 布尔类型（接受 "true"/"false" 等字符串）
# - Optional[str]: 可以是 str 或 None
# - List[int]: 整数列表
# - Dict[str, int]: 键值对
# - Set[str]: 集合（自动去重）
# - Tuple: 元组（固定长度和类型）
# - Decimal: 用于金融计算，避免浮点误差
# - UUID: 唯一标识符
# - datetime/date/time: 日期时间类型
```

### 5.2 `4.2` Pydantic 特殊类型

Pydantic 提供了一系列特殊类型，用于常见的验证场景：

```python
from pydantic import (
    BaseModel,
    EmailStr,          # 邮箱地址
    HttpUrl,           # HTTP/HTTPS URL
    FilePath,          # 文件路径（存在且是文件）
    DirectoryPath,     # 目录路径（存在且是目录）
    SecretStr,         # 敏感字符串（打印时隐藏）
    SecretBytes,       # 敏感字节（打印时隐藏）
    IPvAnyAddress,     # IPv4/IPv6 地址
    PastDate,          # 过去的日期
    FutureDate,        # 未来的日期
    PaymentCardNumber, # 支付卡号
    ByteSize,          # 字节大小
)

class SpecialTypesExample(BaseModel):
    # ========== 联系方式 ==========
    email: EmailStr              # 邮箱地址（自动验证格式）
    website: HttpUrl             # 网站 URL（必须是 http/https）
    
    # ========== 文件路径 ==========
    avatar_path: FilePath         # 头像文件路径（文件必须存在）
    upload_dir: DirectoryPath     # 上传目录（目录必须存在）
    
    # ========== 敏感数据 ==========
    password: SecretStr           # 密码（打印时显示为 ******）
    api_key: SecretBytes          # API 密钥（打印时隐藏）
    
    # ========== 网络相关 ==========
    ip_address: IPvAnyAddress     # IP 地址（IPv4 或 IPv6）
    
    # ========== 时间相关 ==========
    birthday: PastDate             # 出生日期（必须是过去日期）
    appointment: FutureDate        # 预约日期（必须是未来日期）

# 测试 EmailStr
try:
    SpecialTypesExample(
        email="invalid-email",  # 不是有效的邮箱格式
        website="not-a-url",
        ip_address="999.999.999.999"  # 无效的 IP
    )
except Exception as e:
    print(e)

# 测试 SecretStr
user = SpecialTypesExample(
    email="test@example.com",
    website="https://example.com",
    avatar_path="/etc/passwd",
    upload_dir="/tmp",
    password="secret123",
    api_key=b"secret123",
    ip_address="192.168.1.1",
    birthday="2020-01-01",
    appointment="2030-01-01"
)

print(user.password)  # ******（隐藏了实际值）
print(user.model_dump()['password'])  # SecretStr('secret123')
```

**实战示例：用户注册表单**

```python
from pydantic import BaseModel, EmailStr, SecretStr, HttpUrl

class UserRegistration(BaseModel):
    username: str
    email: EmailStr           # 自动验证邮箱格式
    password: SecretStr       # 密码会被隐藏
    website: Optional[HttpUrl] = None  # 可选的网站

# 测试
user = UserRegistration(
    username="zhangsan",
    email="zhangsan@example.com",
    password="12345678",
    website="https://example.com"
)

# 打印时会隐藏敏感信息
print(user.password)  # **********
print(user.model_dump())
# {
#     'username': 'zhangsan',
#     'email': 'zhangsan@example.com',
#     'password': SecretStr('**********'),  # 隐藏
#     'website': 'https://example.com'
# }
```

### 5.3 `4.3` 约束类型（con 开头的类型）

Pydantic 提供了 `con*` 系列函数来创建约束类型：

```python
from pydantic import BaseModel, conint, confloat, constr, conlist, conset

class ConstrainedExample(BaseModel):
    # conint: 约束整数
    percentage: conint(gt=0, lt=100)        # 0-100 之间
    age: conint(ge=0, le=150)              # 0-150 之间
    count: conint(ge=0)                     # 非负整数
    
    # confloat: 约束浮点数
    price: confloat(gt=0)                   # 大于 0
    discount: confloat(ge=0, le=1)         # 0-1 之间（折扣）
    score: confloat(ge=0, decimal_places=2)  # 保留 2 位小数
    
    # constr: 约束字符串
    username: constr(min_length=3, max_length=20)  # 3-20 字符
    phone: constr(pattern=r'^1[3-9]\d{9}$')        # 中国手机号
    slug: constr(pattern=r'^[a-z0-9-]+$')          # URL 友好字符串
    
    # conlist: 约束列表
    ids: conlist(int, min_length=1, max_length=10)  # 1-10 个整数
    
    # conset: 约束集合
    tags: conset(str, min_length=1)  # 至少 1 个标签

# 解释：
# conint: constrained integer - 带约束的整数
# confloat: constrained float - 带约束的浮点数
# constr: constrained string - 带约束的字符串
# conlist: constrained list - 带约束的列表
# conset: constrained set - 带约束的集合
```

### 5.4 `4.4` 枚举类型

```python
from pydantic import BaseModel
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

class Status(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    INACTIVE = "inactive"

class User(BaseModel):
    name: str
    role: UserRole
    status: Status

# 测试
user = User(name="张三", role=UserRole.ADMIN, status=Status.ACTIVE)
print(user.role)          # UserRole.ADMIN
print(user.role.value)    # admin（字符串值）

# 也可以用字符串创建
user2 = User.model_validate({
    "name": "李四",
    "role": "user",       # 字符串 "user"
    "status": "active"    # 字符串 "active"
})
print(user2.role)  # UserRole.USER
```

### 5.5 `4.5` 联合类型和可选类型

```python
from pydantic import BaseModel
from typing import Union, Optional

class FlexibleField(BaseModel):
    # Optional 是 Union[T, None] 的语法糖
    optional_field: Optional[str] = None
    # 等同于
    optional_field2: Union[str, None] = None
    
    # 联合类型：可以是多种类型之一
    # 注意：Pydantic 会按顺序尝试类型转换
    flexible_id: Union[str, int]
    
    # 严格联合：只接受声明的类型，不做转换
    # 需要 Pydantic V2 strict 模式
    strict_field: Union[str, int]

# 测试
obj = FlexibleField(
    optional_field="hello",
    optional_field2="world",
    flexible_id=123,      # 会被转换为字符串 "123"
    strict_field="456"    # 字符串
)
print(obj.flexible_id)  # "123"（int 被转换成了 str）
```

### 5.6 `4.6` 自定义类型

你可以使用 `NewType` 创建类型别名，或创建完整的自定义类型：

```python
from pydantic import BaseModel, field_validator
from typing import NewType

# 方法 1: 使用 NewType（简单的类型别名）
UserId = NewType('UserId', int)
PhoneNumber = NewType('PhoneNumber', str)

class CustomUser(BaseModel):
    user_id: UserId
    phone: PhoneNumber

# 方法 2: 完整的自定义类型（带验证）
class ChinesePhoneNumber(str):
    @classmethod
    def __get_validators__(cls):
        # 返回验证器列表
        yield cls.validate

    @classmethod
    def validate(cls, v):
        # 验证是否是有效的中国手机号
        if not isinstance(v, str):
            raise ValueError("必须是字符串")
        if not v.startswith('1'):
            raise ValueError("手机号必须以 1 开头")
        if len(v) != 11:
            raise ValueError("手机号必须是 11 位")
        return cls(v)

class UserWithPhone(BaseModel):
    phone: ChinesePhoneNumber

# 测试
user = UserWithPhone(phone="13812345678")  # 成功
print(user.phone)  # 13812345678

try:
    UserWithPhone(phone="12345")  # 失败
except Exception as e:
    print(e)  # 手机号必须是 11 位
```

### 5.7 `4.7` 嵌套模型

```python
from pydantic import BaseModel
from typing import Optional, List

class Address(BaseModel):
    city: str
    street: str
    zipcode: str

class User(BaseModel):
    name: str
    address: Address           # 嵌套模型
    previous_addresses: List[Address] = []  # 嵌套模型列表
    backup_address: Optional[Address] = None  # 可选的嵌套模型

# 测试
user = User(
    name="张三",
    address=Address(
        city="北京",
        street="长安街",
        zipcode="100000"
    ),
    previous_addresses=[
        Address(city="上海", street="南京路", zipcode="200000")
    ],
    backup_address=Address(city="广州", street="天河路", zipcode="510000")
)

print(user.model_dump())
# {
#     'name': '张三',
#     'address': {'city': '北京', 'street': '长安街', 'zipcode': '100000'},
#     'previous_addresses': [{'city': '上海', 'street': '南京路', 'zipcode': '200000'}],
#     'backup_address': {'city': '广州', 'street': '天河路', 'zipcode': '510000'}
# }
```

---

## 5. 配置选项

### 6.1 `5.1` 模型配置概述

Pydantic 模型可以通过配置来改变其行为。V2 版本使用 `model_config` 和 `ConfigDict`：

```python
from pydantic import BaseModel, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(
        # 配置项
    )
    
    name: str
    age: int
```

### 6.2 `5.2` 常用配置详解

```python
from pydantic import BaseModel, ConfigDict
from typing import List

class ConfiguredUser(BaseModel):
    model_config = ConfigDict(
        # ========== 验证相关 ==========
        
        # 严格模式：不允许类型自动转换
        # True 时，"25" 不会自动转为 int
        strict=True,
        
        # 验证赋值：修改字段时也进行验证
        validate_assignment=True,
        
        # 验证默认值
        validate_default=True,
        
        # ========== 字符串处理 ==========
        
        # 自动去除首尾空格
        str_strip_whitespace=True,
        
        # 字符串自动转小写
        str_to_lower=False,
        
        # ========== 额外字段 ==========
        
        # extra 字段处理：
        # - 'ignore': 忽略额外字段（默认）
        # - 'forbid': 禁止额外字段
        # - 'allow': 允许额外字段
        extra='ignore',
        
        # ========== 其他 ==========
        
        # 冻结模型（不可变）
        frozen=False,
        
        # 使用别名时的行为
        populate_by_name=True,
        
        # JSON Schema 生成
        json_schema_extra=None,
    )
    
    name: str
    age: int
    tags: List[str] = []

# 解释：
# - strict=True: 启用严格模式，不会自动转换类型
# - validate_assignment=True: 赋值时也验证
# - str_strip_whitespace=True: 自动去除空格
# - extra='ignore': 忽略未知字段
# - extra='forbid': 禁止未知字段
# - frozen=True: 使模型不可变（像 dataclass）
```

**实战示例：严格模式**

```python
from pydantic import BaseModel, ConfigDict

class StrictUser(BaseModel):
    model_config = ConfigDict(strict=True)
    
    name: str
    age: int

# 严格模式下，不允许类型自动转换
user = StrictUser(name="张三", age=25)  # OK

try:
    # age="25" 是字符串，无法自动转换为 int
    StrictUser(name="张三", age="25")
except Exception as e:
    print(e)
    """
    1 validation error for StrictUser
    age
      Input should be a valid integer [type=int_type, input_value='25', input_type=str]
    """
```

**实战示例：禁止额外字段**

```python
from pydantic import BaseModel, ConfigDict

class StrictUser(BaseModel):
    model_config = ConfigDict(extra='forbid')
    
    name: str
    age: int

# 正常创建
user = StrictUser(name="张三", age=25)

try:
    # extra 字段会被拒绝
    StrictUser(name="张三", age=25, unknown_field="value")
except Exception as e:
    print(e)
    """
    1 validation error for StrictUser
    unknown_field
      Extra inputs are not permitted [type=no_extra, input_value='value', input_type=str]
    """
```

### 6.3 `5.3` 使用 Field 进行配置

除了模型级别的配置，还可以在字段级别使用 `Field` 进行配置：

```python
from pydantic import BaseModel, Field

class Product(BaseModel):
    name: str = Field(
        ...,                    # 必填
        min_length=1,           # 最小长度
        max_length=100,         # 最大长度
        description="产品名称",  # 描述
        examples=["iPhone 15"], # 示例值（用于文档）
    )
    price: float = Field(
        ...,
        gt=0,                   # 必须大于 0
        description="产品价格",
        examples=[6999.0],
    )
    quantity: int = Field(
        default=0,
        ge=0,                   # 大于等于 0
        description="库存数量",
    )
```

### 6.4 `5.4` V1 风格配置（了解即可）

Pydantic V1 使用 `class Config` 的方式，V2 仍然支持但推荐使用 `ConfigDict`：

```python
from pydantic import BaseModel

# V1 风格（仍然可用，但不推荐）
class UserV1(BaseModel):
    name: str
    age: int
    
    class Config:
        extra = 'forbid'
        validate_assignment = True

# V2 风格（推荐）
from pydantic import ConfigDict

class UserV2(BaseModel):
    model_config = ConfigDict(
        extra='forbid',
        validate_assignment=True,
    )
    
    name: str
    age: int

# 两种方式效果相同，ConfigDict 更灵活
```

---

## 6. 高级特性

### 7.1 `6.1` 模型继承

Pydantic 支持模型继承，这在 `API` 开发中非常有用：

```python
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# ========== 基础模型 ==========
class BaseUser(BaseModel):
    """基础用户模型：包含所有用户共有的字段"""
    id: int
    name: str
    email: str
    created_at: datetime = Field(default_factory=datetime.now)

# ========== 创建用户（需要密码）==========
class UserCreate(BaseUser):
    """创建用户：需要密码"""
    password: str

# ========== 更新用户（字段都是可选的）==========
class UserUpdate(BaseModel):
    """更新用户：所有字段都是可选的"""
    name: Optional[str] = None
    email: Optional[str] = None

# ========== 数据库用户（包含内部字段）==========
class UserInDB(BaseUser):
    """数据库用户：包含内部字段"""
    hashed_password: str
    is_active: bool = True
    is_superuser: bool = False

# ========== API 响应用户（不暴露敏感信息）==========
class UserResponse(BaseUser):
    """API 响应用户：只包含公开字段"""
    pass

# 解释：
# - BaseUser: 基础模型，定义公共字段
# - UserCreate: 继承 BaseUser，添加密码字段
# - UserUpdate: 不继承，所有字段可选（用于 PATCH）
# - UserInDB: 继承 BaseUser，添加数据库字段
# - UserResponse: 继承 BaseUser，用于 API 响应

# 测试
user_create = UserCreate(
    id=1,
    name="张三",
    email="zhangsan@example.com",
    password="123456"
)
print(user_create.model_dump())
# {'id': 1, 'name': '张三', 'email': 'zhangsan@example.com', 
#  'password': '123456', 'created_at': datetime.datetime(...)}
```

### 7.2 `6.2` 计算属性（computed_field）

计算属性是根据其他字段动态计算的属性：

```python
from pydantic import BaseModel, computed_field

class Rectangle(BaseModel):
    width: float
    height: float

    @computed_field
    @property
    def area(self) -> float:
        """计算面积"""
        return self.width * self.height

    @computed_field
    @property
    def perimeter(self) -> float:
        """计算周长"""
        return 2 * (self.width + self.height)

    @computed_field
    @property
    def is_square(self) -> bool:
        """判断是否为正方形"""
        return self.width == self.height

# 测试
rect = Rectangle(width=10, height=5)
print(f"面积: {rect.area}")        # 50
print(f"周长: {rect.perimeter}")  # 30
print(f"是否正方形: {rect.is_square}")  # False

# 序列化时包含计算属性
print(rect.model_dump())
# {'width': 10, 'height': 5, 'area': 50, 'perimeter': 30, 'is_square': False}
```

### 7.3 `6.3` 自定义序列化器

你可以自定义字段的序列化方式：

```python
from pydantic import BaseModel, field_serializer
from datetime import datetime, date

class Event(BaseModel):
    name: str
    start_time: datetime
    event_date: date

    @field_serializer('start_time')
    def serialize_datetime(self, value: datetime) -> str:
        """将 datetime 格式化为自定义字符串"""
        return value.strftime('%Y年%m月%d日 %H:%M')

    @field_serializer('event_date')
    def serialize_date(self, value: date) -> str:
        """将 date 格式化为字符串"""
        return value.isoformat()

# 测试
event = Event(
    name="产品发布会",
    start_time=datetime(2024, 1, 15, 14, 30),
    event_date=date(2024, 1, 15)
)

print(event.model_dump())
# {
#     'name': '产品发布会',
#     'start_time': '2024年01月15日 14:30',
#     'event_date': '2024-01-15'
# }

# 解释：
# @field_serializer 装饰器用于自定义序列化
# - 第一个参数是字段名
# - 函数接收字段值，返回序列化后的值
```

### 7.4 `6.4` 反序列化器

你也可以自定义反序列化（从字典/`JSON` 创建对象）：

```python
from pydantic import BaseModel, field_validator
from datetime import datetime

class Event(BaseModel):
    name: str
    start_time: datetime

    @field_validator('start_time', mode='before')
    @classmethod
    def parse_datetime(cls, v):
        """解析多种格式的日期时间"""
        if isinstance(v, datetime):
            return v
        if isinstance(v, str):
            # 尝试多种格式
            for fmt in ['%Y-%m-%d %H:%M:%S', '%Y-%m-%d', '%Y/%m/%d %H:%M']:
                try:
                    return datetime.strptime(v, fmt)
                except ValueError:
                    continue
        raise ValueError(f"无法解析日期时间: {v}")

# 测试
event1 = Event(name="活动1", start_time="2024-01-15 14:30:00")
event2 = Event(name="活动2", start_time="2024-01-15")
event3 = Event(name="活动3", start_time=datetime(2024, 1, 15, 14, 30))

print(event1.start_time)  # 2024-01-15 14:30:00
print(event2.start_time)  # 2024-01-15 00:00:00
print(event3.start_time)  # 2024-01-15 14:30:00
```

### 7.5 `6.5` 泛型模型

泛型模型可以创建可复用的数据模板：

```python
from pydantic import BaseModel
from typing import TypeVar, Generic, List

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    """泛型分页响应模型"""
    total: int
    page: int
    page_size: int
    items: List[T]

class User(BaseModel):
    id: int
    name: str

class Product(BaseModel):
    id: int
    title: str
    price: float

# 使用泛型模型
user_page = PaginatedResponse[User](
    total=100,
    page=1,
    page_size=10,
    items=[
        User(id=1, name="张三"),
        User(id=2, name="李四")
    ]
)

product_page = PaginatedResponse[Product](
    total=50,
    page=1,
    page_size=10,
    items=[
        Product(id=1, title="iPhone", price=6999.0),
        Product(id=2, title="MacBook", price=9999.0)
    ]
)

print(user_page.model_dump())
# {
#     'total': 100,
#     'page': 1,
#     'page_size': 10,
#     'items': [{'id': 1, 'name': '张三'}, {'id': 2, 'name': '李四'}]
# }
```

### 7.6 `6.6` 递归模型（自引用）

模型可以引用自身，用于表示树形结构：

```python
from pydantic import BaseModel
from typing import Optional, List

class Comment(BaseModel):
    id: int
    content: str
    author: str
    replies: Optional[List['Comment']] = None

# 需要调用 model_rebuild() 来支持前向引用
Comment.model_rebuild()

# 测试
comment = Comment(
    id=1,
    content="这是一个评论",
    author="张三",
    replies=[
        Comment(id=2, content="回复1", author="李四"),
        Comment(id=3, content="回复2", author="王五", replies=[
            Comment(id=4, content="回复的回复", author="赵六")
        ])
    ]
)

print(comment.model_dump(indent=2))
# {
#     "id": 1,
#     "content": "这是一个评论",
#     "author": "张三",
#     "replies": [
#         {"id": 2, "content": "回复1", "author": "李四", "replies": null},
#         {
#             "id": 3,
#             "content": "回复2",
#             "author": "王五",
#             "replies": [
#                 {"id": 4, "content": "回复的回复", "author": "赵六", "replies": null}
#             ]
#         }
#     ]
# }
```

### 7.7 `6.7` 别名支持

别名允许使用不同的名称来处理数据：

```python
from pydantic import BaseModel, Field, ConfigDict

class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    name: str = Field(alias='userName')
    age: int = Field(alias='userAge')
    email: str = Field(alias='userEmail')

# 使用原名创建
user1 = User(name="张三", age=25, email="test@example.com")

# 使用别名创建
user2 = User.model_validate({
    'userName': '张三',
    'userAge': 25,
    'userEmail': 'test@example.com'
})

# 混合使用也可以
user3 = User.model_validate({
    'name': '张三',
    'userAge': 25,
    'email': 'test@example.com'
})

# 序列化时使用别名
print(user1.model_dump(by_alias=True))
# {'userName': '张三', 'userAge': 25, 'userEmail': 'test@example.com'}
```

---

## 7. 与 `FastAPI` 集成

### 8.1 `7.1` 请求体验证

`FastAPI` 与 Pydantic 无缝集成，自动验证请求体：

```python
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr, Field

app = FastAPI()

class UserCreate(BaseModel):
    """用户创建请求模型"""
    name: str = Field(
        ...,  # 必填
        min_length=2,
        max_length=50,
        description="用户名",
        examples=["张三"]
    )
    email: EmailStr = Field(
        ...,
        description="邮箱地址",
        examples=["zhangsan@example.com"]
    )
    age: int = Field(
        ...,
        ge=0,  # 大于等于 0
        le=150,
        description="年龄",
        examples=[25]
    )
    
    # V2 配置方式
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "name": "张三",
                    "email": "zhangsan@example.com",
                    "age": 25
                }
            ]
        }
    }

@app.post("/users/")
async def create_user(user: UserCreate):
    """
    创建用户
    
    - name: 用户名（2-50个字符）
    - email: 邮箱地址（必须有效）
    - age: 年龄（0-150）
    """
    return {
        "message": "用户创建成功",
        "user": user.model_dump()
    }

# 测试
# curl -X POST "http://localhost:8000/users/" \
#   -H "Content-Type: application/json" \
#   -d '{"name":"张三","email":"zhangsan@example.com","age":25}'
```

### 8.2 `7.2` 响应模型

使用 `response_model` 定义响应格式：

```python
from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
from typing import List

app = FastAPI()

class UserResponse(BaseModel):
    """用户响应模型"""
    id: int
    name: str
    email: str
    created_at: datetime
    
    # 配置：支持从 ORM 对象创建
    model_config = {"from_attributes": True}

@app.get("/users/", response_model=List[UserResponse])
async def get_users():
    """获取用户列表"""
    # 假设从数据库获取的数据
    users = [
        {
            "id": 1,
            "name": "张三",
            "email": "zhangsan@example.com",
            "created_at": datetime.now()
        },
        {
            "id": 2,
            "name": "李四",
            "email": "lisi@example.com",
            "created_at": datetime.now()
        }
    ]
    return users

# 解释：
# - response_model: 指定返回数据的模型
# - FastAPI 会自动序列化数据
# - from_attributes=True: 支持从 ORM 对象（Pydantic V2）
# - V1 使用 class Config: from_attributes = True
```

### 8.3 `7.3` 表单数据验证

`FastAPI` 支持表单数据验证：

```python
from fastapi import FastAPI, Form
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

class LoginForm(BaseModel):
    """登录表单"""
    username: str
    password: str
    
    @classmethod
    def as_form(cls, username: str = Form(...), password: str = Form(...)):
        """从表单数据创建模型"""
        return cls(username=username, password=password)

@app.post("/login/")
async def login(form: LoginForm = Depends(LoginForm.as_form)):
    """登录接口"""
    return {"message": "登录成功", "username": form.username}

# 解释：
# - Form(...) 表示从表单数据中获取
# - Depends 是 FastAPI 的依赖注入
# - as_form 是将表单数据转换为 Pydantic 模型的方法
```

### 8.4 `7.4` 查询参数验证

```python
from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI()

class PaginationParams(BaseModel):
    """分页参数"""
    page: int = Query(1, ge=1, description="页码")
    page_size: int = Query(10, ge=1, le=100, description="每页数量")

@app.get("/users/")
async def get_users(
    pagination: PaginationParams,
    search: Optional[str] = Query(None, description="搜索关键词"),
    tags: List[str] = Query([], description="标签过滤")
):
    """获取用户列表（带分页和搜索）"""
    return {
        "page": pagination.page,
        "page_size": pagination.page_size,
        "search": search,
        "tags": tags,
        "users": []
    }

# 解释：
# - Query: 定义查询参数
# - ge/le: 数值约束
# - Optional: 可选参数
# - List[str]: 多个值
```

### 8.5 `7.5` 路径参数验证

```python
from fastapi import FastAPI, Path
from pydantic import BaseModel

app = FastAPI()

@app.get("/users/{user_id}")
async def get_user(user_id: int = Path(..., ge=1, description="用户ID")):
    """获取用户详情"""
    return {"user_id": user_id, "name": "张三"}

@app.get("/products/{category}/{product_id}")
async def get_product(
    category: str = Path(..., min_length=1, description="产品分类"),
    product_id: int = Path(..., ge=1, description="产品ID")
):
    """获取产品详情"""
    return {"category": category, "product_id": product_id}
```

---

## 8. 最佳实践与项目结构

### 9.1 `8.1` 推荐的项目结构

```
project/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── models/              # 数据库模型（SQLAlchemy 等）
│   │   ├── __init__.py
│   │   └── user.py
│   ├── schemas/             # Pydantic 模型（请求/响应）
│   │   ├── __init__.py
│   │   ├── base.py          # 基础 Schema
│   │   └── user.py          # 用户相关 Schema
│   ├── api/                 # API 路由
│   │   ├── __init__.py
│   │   └── users.py
│   ├── services/            # 业务逻辑
│   │   ├── __init__.py
│   │   └── user.py
│   └── database.py          # 数据库配置
├── requirements.txt
└── README.md
```

### 9.2 `8.2` Schema 组织模式

```python
# schemas/base.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class BaseSchema(BaseModel):
    """所有 Schema 的基类"""
    model_config = ConfigDict(
        from_attributes=True,      # 支持从 ORM 对象创建
        populate_by_name=True,     # 支持使用原名赋值
        str_strip_whitespace=True, # 自动去除空格
    )

# schemas/user.py
from pydantic import Field, EmailStr
from typing import Optional
from datetime import datetime
from .base import BaseSchema

class UserBase(BaseSchema):
    """用户基础字段"""
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    """创建用户"""
    password: str = Field(..., min_length=8)

class UserUpdate(BaseSchema):
    """更新用户（所有字段可选）"""
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)

class UserInDB(UserBase):
    """数据库用户（包含内部字段）"""
    id: int
    hashed_password: str
    is_active: bool = True
    is_superuser: bool = False
    created_at: datetime

class UserResponse(UserBase):
    """API 响应用户"""
    id: int
    is_active: bool
    created_at: datetime

# 解释：
# - BaseSchema: 所有 Schema 的基类，配置一次即可
# - UserBase: 基础字段，所有用户模型都包含
# - UserCreate: 创建时需要
# - UserUpdate: 更新时使用（字段可选）
# - UserInDB: 数据库存储的完整信息
# - UserResponse: API 返回的数据（不包含密码）
```

### 9.3 `8.3` 统一响应包装器

```python
from pydantic import BaseModel
from typing import TypeVar, Generic, Optional

T = TypeVar('T')

class ResponseWrapper(BaseModel, Generic[T]):
    """统一响应包装器"""
    code: int = 200
    message: str = "success"
    data: Optional[T] = None

class PaginatedData(BaseModel, Generic[T]):
    """分页数据包装器"""
    items: list[T]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool

# 使用示例
from typing import List

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

@app.get("/users/", response_model=ResponseWrapper[PaginatedData[UserResponse]]])
async def list_users():
    users = [
        UserResponse(id=1, name="张三", email="zhangsan@example.com"),
        UserResponse(id=2, name="李四", email="lisi@example.com"),
    ]
    return ResponseWrapper(
        data=PaginatedData(
            items=users,
            total=100,
            page=1,
            page_size=10,
            has_next=True,
            has_prev=False
        )
    )

# 响应示例：
# {
#     "code": 200,
#     "message": "success",
#     "data": {
#         "items": [
#             {"id": 1, "name": "张三", "email": "zhangsan@example.com"},
#             {"id": 2, "name": "李四", "email": "lisi@example.com"}
#         ],
#         "total": 100,
#         "page": 1,
#         "page_size": 10,
#         "has_next": true,
#         "has_prev": false
#     }
# }
```

### 9.4 `8.4` 错误处理

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError

app = FastAPI()

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    """处理 Pydantic 验证错误"""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
            "input": error.get("input")
        })
    
    return JSONResponse(
        status_code=422,
        content={
            "code": 422,
            "message": "数据验证失败",
            "errors": errors
        }
    )

# 测试错误响应
class User(BaseModel):
    name: str
    age: int

@app.post("/test/")
async def test_validation(user: User):
    return user

# curl -X POST "http://localhost:8000/test/" \
#   -H "Content-Type: application/json" \
#   -d '{"name":"张"}'
# 
# 响应：
# {
#     "code": 422,
#     "message": "数据验证失败",
#     "errors": [
#         {
#             "field": "age",
#             "message": "Field required",
#             "type": "missing",
#             "input": {"name": "张"}
#         },
#         {
#             "field": "name",
#             "message": "String should have at least 2 characters",
#             "type": "string_too_short",
#             "input": "张"
#         }
#     ]
# }
```

### 9.5 `8.5` 性能优化

```python
from pydantic import BaseModel, ConfigDict

class OptimizedModel(BaseModel):
    """优化后的模型"""
    model_config = ConfigDict(
        # 禁用验证赋值以提高性能（如果不需要）
        validate_assignment=False,
        
        # 忽略额外字段，避免检查
        extra='ignore',
        
        # 使用 slots 减少内存占用（Python 3.10+）
        # 注意：与 validators 可能不兼容
        # slots=True
    )
    
    name: str
    age: int

# 其他优化建议：
# 1. 避免过度使用 Optional
# 2. 使用适当的类型，避免类型转换
# 3. 复杂验证逻辑放在 model_validator 中
# 4. 对于高频创建的对象，考虑使用 __slots__
```

### 9.6 `8.6` 常见模式

**模式一：密码处理**

```python
from pydantic import BaseModel, field_validator, SecretStr
import hashlib

class UserWithPassword(BaseModel):
    name: str
    password: SecretStr
    
    @field_validator('password', mode='before')
    @classmethod
    def hash_password(cls, v):
        """自动哈希密码"""
        if isinstance(v, SecretStr):
            v = v.get_secret_value()
        return hashlib.sha256(v.encode()).hexdigest()

# 解释：
# - mode='before': 在类型检查之前执行
# - 自动将密码哈希存储
# - 读取时使用 SecretStr 保护
```

**模式二：自动生成字段**

```python
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class AutoGeneratedFields(BaseModel):
    """自动生成字段的模型"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    
    # 可以在 model_validator 中更新 updated_at
    
# 测试
obj = AutoGeneratedFields(name="测试")
print(obj.id)        # 生成的 UUID
print(obj.created_at)  # 创建时间
```

**模式三：条件验证**

```python
from pydantic import BaseModel, model_validator
from typing import Optional

class Subscription(BaseModel):
    plan: str
    billing_cycle: str
    
    # 根据计划类型验证
    @model_validator(mode='after')
    def validate_billing(self):
        if self.plan == 'free' and self.billing_cycle != 'monthly':
            raise ValueError('免费计划只能按月计费')
        return self
```

---

## 9. 版本差异与迁移

### 10.1 `9.1` V1 vs V2 主要差异

| 特性 | V1 | V2 |
|------|----|----|
| 验证器装饰器 | `@validator` | `@field_validator` |
| 模型验证器 | `@root_validator` | `@model_validator` |
| 序列化方法 | `.dict()` / `.json()` | `.model_dump()` / `.model_dump_json()` |
| 解析方法 | `.parse_obj()` / `.parse_raw()` | `.model_validate()` / `.model_validate_json()` |
| 配置方式 | `class Config` | `model_config = ConfigDict()` |
| 性能 | 良好 | 提升 5-50 倍 |
| 核心实现 | `Python` | Rust (pydantic-core) |

### 10.2 `9.2` 代码迁移对照

```python
# ========== V1 写法 ==========
from pydantic import BaseModel, validator

class UserV1(BaseModel):
    name: str
    
    @validator('name')
    def validate_name(cls, v):
        return v

    def dict(self):
        return super().dict()

# ========== V2 写法 ==========
from pydantic import BaseModel, field_validator, ConfigDict

class UserV2(BaseModel):
    model_config = ConfigDict(strict=True)
    
    name: str
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        return v
    
    def model_dump(self):
        return super().model_dump()

# ========== 更多迁移 ==========

# V1 -> V2
# @validator -> @field_validator
# @root_validator -> @model_validator  
# .dict() -> .model_dump()
# .json() -> .model_dump_json()
# .parse_obj() -> .model_validate()
# .parse_raw() -> .model_validate_json()
# class Config -> model_config = ConfigDict()
```

### 10.3 `9.3` 兼容性配置

如果需要兼容 V1 代码，可以使用 `BaseModel.from_orm()`：

```python
# V2 中兼容 V1 的方式
from pydantic import BaseModel

class User(BaseModel):
    name: str
    age: int
    model_config = {"from_attributes": True}  # 相当于 V1 的 from_orm = True

# 从 ORM 对象创建（V2）
user = User.model_validate(orm_object)

# 旧版本写法（仍然可用，但不推荐）
user = User.from_orm(orm_object)
```

---

## 11、总结

### 11.1 核心要点回顾

1. **BaseModel 是核心**：所有数据模型都继承自它
2. **类型注解驱动**：用 `Python` 类型定义数据模型
3. **自动验证**：创建实例时自动验证数据
4. **灵活配置**：通过 `model_config` 和 `Field` 定制行为
5. **序列化简单**：`.model_dump()` 和 `.model_dump_json()`

### 11.2 Pydantic 的优势

- **声明式**：用类型注解声明数据结构，比命令式验证更简洁
- **类型安全**：利用 `Python` 类型系统，减少运行时错误
- **文档友好**：自动生成 `JSON` Schema，可用于 `API` 文档
- **性能优秀**：V2 使用 Rust，性能大幅提升
- **生态完善**：与 `FastAPI`、SQLAlchemy 等深度集成

### 11.3 学习路径建议

1. **入门**：掌握 BaseModel、字段类型、模型实例化
2. **进阶**：学习 field_validator、model_validator、Field
3. **深入**：理解泛型、继承、序列化器
4. **实战**：结合 `FastAPI` 开发 REST `API`

掌握 Pydantic 是现代 `Python` 后端开发的必备技能，特别是在构建类型安全、高性能的 Web 应用时。希望这份详解文档能帮助你更好地理解和使用 Pydantic！
