"""离线观察工具名称、描述和参数 Schema 如何帮助模型选工具。"""

from typing import Literal

from langchain_core.tools import tool
from pydantic import BaseModel, Field


class PolicyQuery(BaseModel):
    """限制模型只能提交业务支持的查询参数。"""

    topic: Literal["年假", "报销"] = Field(description="要查询的制度主题")
    department: str = Field(description="发起查询的部门名称")


@tool(args_schema=PolicyQuery)
def search_policy(topic: str, department: str) -> str:
    """搜索年假或报销制度；不要用于订单、合同或员工隐私查询。"""
    return f"已为{department}检索{topic}制度。"


def main() -> None:
    """打印模型进行工具选择时能够看到的全部契约。"""
    print("名称：", search_policy.name)
    print("描述：", search_policy.description)
    print("Schema：", search_policy.args_schema.model_json_schema())


if __name__ == "__main__":
    main()
