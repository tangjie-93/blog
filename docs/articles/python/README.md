---
title: Python 基础与工程实践学习路线
date: '2026-10-13'
type: 技术
tags: Python
note: 从语言基础、标准库到 Web、数据处理和 AI 应用，建立可维护的 Python 工程能力。
---

`Python` 适合快速验证想法，也适合承载数据处理、自动化脚本和 `AI` 应用。学习重点不是记住所有语法，而是建立“能读、能测、能部署”的工程习惯。

## 一、先掌握语言骨架

1. **基本语法**：变量、条件、循环、函数、异常和模块。
2. **核心数据结构**：`list`、`tuple`、`dict`、`set`，理解可变对象与不可变对象。
3. **面向对象**：类、继承、组合、属性和协议；优先使用清晰的组合关系。
4. **迭代器与生成器**：用惰性计算处理大文件和数据流。
5. **类型标注**：使用 `typing` 描述接口，让编辑器和静态检查工具更早发现错误。

```python
from collections.abc import Iterable


def chunks(items: Iterable[str], size: int) -> Iterable[list[str]]:
    batch: list[str] = []
    for item in items:
        batch.append(item)
        if len(batch) == size:
            yield batch
            batch = []
    if batch:
        yield batch
```

## 二、形成工程习惯

- 用 `venv` 或 `uv` 隔离项目依赖，用 `pyproject.toml` 记录项目配置。
- 用 `pytest` 编写单元测试，用 `ruff` 做检查和格式化。
- 把配置放进环境变量或 `.env`，不要把密钥写进源码。
- 用日志记录关键上下文，异常边界返回清晰、可操作的错误信息。
- 先定义模块职责，再决定目录结构；小项目也要避免一个文件承担所有事情。

## 三、按目标选择方向

| 方向 | 建议学习内容 |
| --- | --- |
| Web 服务 | `FastAPI`、请求校验、数据库、鉴权、异步任务 |
| 数据处理 | `NumPy`、`pandas`、文件格式、任务调度 |
| 自动化 | `pathlib`、`subprocess`、浏览器自动化、定时任务 |
| AI 应用 | `HTTP API`、结构化输出、向量数据库、评测与监控 |

## 四、推荐练习顺序

1. 写一个命令行记账或文件整理工具。
2. 把工具封装成带测试的 `FastAPI` 服务。
3. 加入数据库、日志、配置管理和容器化。
4. 接入一个模型服务，完成可观测、可回归的 `AI` 功能。

`Python` 的优势在于生态和表达力，长期质量取决于边界、测试和运行方式。

## 后端学习资料

按主题和阅读顺序浏览：[后端与智能应用学习索引](./后端与智能应用学习索引.md)。

- [SQLModel详解](./SQLModel%E8%AF%A6%E8%A7%A3.md)
- [PostgreSQL数据库配置与 DBeaver 连接指南](./PostgreSQL%E6%95%B0%E6%8D%AE%E5%BA%93%E9%85%8D%E7%BD%AE%E4%B8%8E%20DBeaver%20%E8%BF%9E%E6%8E%A5%E6%8C%87%E5%8D%97.md)
- [FastAPI知识点总结](./FastAPI%E7%9F%A5%E8%AF%86%E7%82%B9%E6%80%BB%E7%BB%93.md)
- [FastAPI学习行动指南](./FastAPI%E5%AD%A6%E4%B9%A0%E8%A1%8C%E5%8A%A8%E6%8C%87%E5%8D%97.md)
- [PostgreSQL命令参考](./PostgreSQL%E5%91%BD%E4%BB%A4%E5%8F%82%E8%80%83.md)
- [Pydantic详解](./Pydantic%E8%AF%A6%E8%A7%A3.md)
- [poetry命令总结](./poetry%E5%91%BD%E4%BB%A4%E6%80%BB%E7%BB%93.md)
- [Python 后端全栈行动指南](./Python%20%E5%90%8E%E7%AB%AF%E5%85%A8%E6%A0%88%E8%A1%8C%E5%8A%A8%E6%8C%87%E5%8D%97.md)
- [Python 后端全栈学习路线](./Python%20%E5%90%8E%E7%AB%AF%E5%85%A8%E6%A0%88%E5%AD%A6%E4%B9%A0%E8%B7%AF%E7%BA%BF.md)
- [Poetry-pyproject详解](./Poetry-pyproject%E8%AF%A6%E8%A7%A3.md)
- [uv-guide](./uv-guide.md)
