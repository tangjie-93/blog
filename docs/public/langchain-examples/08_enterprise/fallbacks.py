"""离线演示检索为空、权限不足、模型超时、工具和解析失败的分类兜底。"""


class PermissionDeniedError(Exception):
    """表示用户无权访问检索目标。"""


def user_message(error: Exception | None, has_context: bool) -> str:
    """把内部失败映射为不泄露堆栈的用户提示。"""
    if isinstance(error, PermissionDeniedError):
        return "你没有权限访问该制度。"
    if isinstance(error, TimeoutError):
        return "模型响应超时，请稍后重试。"
    if isinstance(error, ValueError):
        return "回答格式异常，已转入降级处理。"
    if error is not None:
        return "工具暂时不可用，请稍后重试。"
    if not has_context:
        return "当前知识库没有找到依据，无法回答。"
    return "可以继续生成有依据的回答。"


def main() -> None:
    """打印五类常见失败及正常路径的用户提示。"""
    scenarios = [
        None,
        PermissionDeniedError(),
        TimeoutError(),
        RuntimeError(),
        ValueError(),
    ]
    for error in scenarios:
        print(user_message(error, has_context=error is None))
    print(user_message(None, has_context=False))


if __name__ == "__main__":
    main()
