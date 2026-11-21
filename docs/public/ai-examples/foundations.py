"""AI 基础实验：仅 Python 3 标准库，无模型下载、网络或 GPU 需求。
运行：python3 foundations.py；测试：python3 foundations.py --test
这里只复现数学机制，不训练或调用真实语言模型。
"""
import math
import random
import sys
import unittest


def softmax(logits, temperature=1.0):
    if not math.isfinite(temperature) or temperature <= 0:
        raise ValueError("temperature 必须是有限正数；贪心选择请单独使用 argmax")
    if not logits or not all(math.isfinite(x) for x in logits):
        raise ValueError("logits 必须是非空的有限数列表")
    maximum = max(logits)
    weights = [math.exp((x - maximum) / temperature) for x in logits]
    total = sum(weights)
    return [x / total for x in weights]


def nucleus(probabilities, top_p):
    if not 0 < top_p <= 1:
        raise ValueError("top_p 必须位于 (0, 1]")
    if (not probabilities or any(not math.isfinite(p) or p < 0 for p in probabilities)
            or not math.isclose(sum(probabilities), 1.0, abs_tol=1e-9)):
        raise ValueError("输入必须为和为 1 的非负有限概率")
    ranked = sorted(enumerate(probabilities), key=lambda item: (-item[1], item[0]))
    kept, cumulative = [], 0.0
    for index, probability in ranked:
        kept.append((index, probability))
        cumulative += probability
        if cumulative >= top_p:
            break
    return [(index, probability / cumulative) for index, probability in kept]


def attention(q, k, v, causal=False):
    """单序列、单头、等长 self-attention；真实模型另需批次与 padding mask。"""
    if not q or not k or not v or len(q) != len(k) or len(k) != len(v):
        raise ValueError("q/k/v 必须非空且序列长度相同")
    d, dv = len(q[0]), len(v[0])
    if not d or not dv or any(len(row) != d for row in q + k) or any(len(row) != dv for row in v):
        raise ValueError("特征维度必须一致且非空")
    weights, output = [], []
    for position, query in enumerate(q):
        scores = [sum(a * b for a, b in zip(query, key)) / math.sqrt(d) for key in k]
        visible = position + 1 if causal else len(k)
        row = softmax(scores[:visible]) + [0.0] * (len(k) - visible)
        weights.append(row)
        output.append([sum(row[j] * v[j][c] for j in range(len(v))) for c in range(dv)])
    return weights, output


def gradient_step(w=1.0, b=0.0, x=2.0, y=4.0, rate=0.1):
    error = w * x + b - y
    return w - rate * error * x, b - rate * error


def train_regression(rate=0.05, steps=200):
    """无噪声 y=3x+1，仅展示收敛，不作为泛化或真实效果评测。"""
    samples = [(-2.0, -5.0), (-1.0, -2.0), (0.0, 1.0), (1.0, 4.0), (2.0, 7.0)]
    w, b = 0.0, 0.0
    losses = []
    for _ in range(steps):
        errors = [w * x + b - y for x, y in samples]
        losses.append(sum(e * e / 2 for e in errors) / len(samples))
        dw = sum(e * x for e, (x, _) in zip(errors, samples)) / len(samples)
        db = sum(errors) / len(samples)
        w -= rate * dw
        b -= rate * db
    return w, b, losses


class FoundationTests(unittest.TestCase):
    def test_gradient(self):
        w, b = gradient_step()
        self.assertAlmostEqual(w, 1.4)
        self.assertAlmostEqual(b, 0.2)
        self.assertAlmostEqual((w * 2 + b - 4) ** 2 / 2, 0.5)

    def test_convergence(self):
        w, b, losses = train_regression()
        self.assertAlmostEqual(w, 3, places=4)
        self.assertAlmostEqual(b, 1, places=4)
        self.assertLess(losses[-1], losses[0])

    def test_nucleus_includes_threshold_crossing_token(self):
        self.assertEqual([i for i, _ in nucleus([0.6, 0.3, 0.1], 0.8)], [0, 1])
        self.assertEqual(len(nucleus([0.6, 0.3, 0.1], 0.5)), 1)
        self.assertEqual(len(nucleus([0.6, 0.3, 0.1], 1.0)), 3)
        self.assertAlmostEqual(sum(p for _, p in nucleus([0.6, 0.3, 0.1], 0.8)), 1)

    def test_stable_softmax(self):
        self.assertAlmostEqual(sum(softmax([10000, 9999])), 1)
        self.assertGreater(softmax([2, 1], 0.5)[0], softmax([2, 1], 1)[0])
        for invalid in [0, -1, float('nan')]:
            with self.assertRaises(ValueError):
                softmax([1, 2], invalid)
        with self.assertRaises(ValueError):
            nucleus([0.6, 0.3, 0.1], 0)

    def test_causal_mask(self):
        q = k = [[1.0, 0.0], [0.0, 1.0]]
        v = [[10.0, 0.0], [0.0, 20.0]]
        weights, output = attention(q, k, v, causal=True)
        self.assertEqual(weights[0], [1.0, 0.0])
        self.assertEqual(output[0], v[0])
        self.assertAlmostEqual(sum(weights[1]), 1)
        _, changed = attention(q, k, [[10.0, 0.0], [999.0, 999.0]], causal=True)
        self.assertEqual(changed[0], output[0])
        weights, output = attention(q, k, v)
        self.assertAlmostEqual(weights[0][0], 0.66976155, places=6)
        self.assertAlmostEqual(output[0][0], 6.6976155, places=6)


def demo():
    w, b = gradient_step()
    print(f"单步更新：w={w:.1f}, b={b:.1f}, 新损失={(w * 2 + b - 4) ** 2 / 2:.1f}")
    w, b, losses = train_regression()
    print(f"线性回归：w={w:.4f}, b={b:.4f}, 损失 {losses[0]:.4f} → {losses[-1]:.8f}")
    q = k = [[1.0, 0.0], [0.0, 1.0]]
    v = [[10.0, 0.0], [0.0, 20.0]]
    print("无 mask：", attention(q, k, v))
    print("因果 mask：", attention(q, k, v, causal=True))
    print("top-p=0.8：", nucleus([0.6, 0.3, 0.1], 0.8))
    rng = random.Random(7)
    candidates = nucleus([0.6, 0.3, 0.1], 0.8)
    print("固定种子采样示意：", rng.choices([i for i, _ in candidates], [p for _, p in candidates], k=10))


if __name__ == '__main__':
    if '--test' in sys.argv:
        unittest.main(argv=[sys.argv[0]])
    else:
        demo()
