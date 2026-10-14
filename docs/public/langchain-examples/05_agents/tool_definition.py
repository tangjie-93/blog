"""离线演示职责清晰、参数简单且具有异常兜底的 Tool。"""

from langchain_core.tools import tool


@tool
def get_reimbursement_rule(amount: float) -> str:
    """查询报销审批规则；amount 是单笔含税金额，不能为负数。"""
    if amount < 0:
        return "工具调用失败：报销金额不能为负数。"
    if amount > 5000:
        return "需要部门负责人审批后提交财务。"
    return "可以直接提交财务审核。"


def main() -> None:
    """展示正常输入和非法输入的可理解返回。"""
    print(get_reimbursement_rule.invoke({"amount": 6800}))
    print(get_reimbursement_rule.invoke({"amount": -1}))


if __name__ == "__main__":
    main()
