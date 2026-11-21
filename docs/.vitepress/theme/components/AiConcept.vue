<script setup lang="ts">
import { computed, ref, useId } from 'vue'
const props = withDefaults(defineProps<{ mode?: string }>(), { mode: 'learning' })
type Step = [string, string, string]
const maps: Record<string, { title: string; note: string; steps: Step[] }> = {
  learning: { title: '从模型计算走到可靠系统', note: '箭头表示知识依赖，不表示必须从头读到尾。应用路线可先读第 03 章，再按需补基础。', steps: [
    ['数学与学习', '误差如何改变参数', '先手算一次预测、损失、梯度和更新。参数变好了，不等于测试数据也会变好。'],
    ['模型与生成', '向量如何变成文字', '注意力混合上下文信息，语言模型给出下一 token 分布；概率不是事实置信度。'],
    ['数据与证据', '检索外部知识', '解析、切分、索引、权限和版本共同决定模型能看到哪些证据。'],
    ['工具与行动', '由程序守住边界', '模型只提出动作；运行时校验身份、参数、预算，再决定是否执行。'],
    ['评测与部署', '用失败样本迭代', '同时观察质量、延迟、成本与安全；一次只改一个变量，保留回滚版本。'],
  ] },
  training: { title: '一次参数更新的计算链', note: '前向计算产生误差，反向传播计算梯度，优化器更新参数；测试集不能参与更新。', steps: [
    ['输入 x', '样本与标签 y', '训练样本必须只包含预测时真正可获得的信息，不能混入未来结果。'],
    ['预测 ŷ', '使用当前参数', '例如 x=2，w=1，b=0，线性模型预测 ŷ=2。'],
    ['损失 L', '衡量预测误差', '若 y=4，使用 L=(ŷ−y)²/2，则当前损失为 2。'],
    ['梯度 g', '局部变化率', 'dL/dw=(ŷ−y)x=−4，dL/db=−2；负梯度给出局部下降方向。'],
    ['更新 θ', '学习率 η=0.1', 'w 变为 1.4，b 变为 0.2；同一样本预测为 3，损失降至 0.5。'],
  ] },
  transformer: { title: 'Decoder 的信息流', note: '这是常见 Pre-Norm 结构的概念图；具体归一化、MLP 和位置编码以模型实现为准。', steps: [
    ['Token IDs', '[B,T]', 'ID 是词表下标，没有数值大小上的语义距离。查表后得到 [B,T,D] 向量。'],
    ['Q / K / V', '三个投影', '同一个输入经过不同权重矩阵，得到查询、匹配线索和待汇总内容。'],
    ['因果注意力', '只看当前与过去', '先缩放点积，再遮住未来，最后按行 softmax，用权重对 V 求加权和。'],
    ['残差与 MLP', '保留并变换信息', '注意力在位置间交换信息；MLP 在各位置变换特征，两者都通过残差接回主干。'],
    ['词表投影', '[B,T,Vocab]', '最后的隐藏状态投影成 logits。训练比较正确下一 token；推理选择下一 token。'],
  ] },
  generation: { title: '语言模型的一次生成循环', note: '输入上下文会影响输出，但不会在普通推理中更新模型权重。', steps: [
    ['组装上下文', '角色、历史、证据', '先做权限与 token 预算检查。检索文本和工具返回值都是数据，不是新的系统指令。'],
    ['分词与前向', '得到 logits', 'Tokenizer 把文本编码成 ID；模型计算下一位置的词表分数。'],
    ['约束与采样', 'softmax / top-p', '格式约束可排除非法 token，采样控制随机性；两者都不证明输出事实正确。'],
    ['追加 token', '更新生成状态', '把选出的 token 追加到序列，复用旧位置的 K/V。解码后的文本不一定每步都是完整字符。'],
    ['停止与校验', '长度、终止符、协议', '检查停止原因、JSON Schema 与业务规则。因长度截断的输出不能当完整成功结果。'],
  ] },
  embedding: { title: '文本如何成为可检索的向量', note: '向量只是检索表示；原文、来源、版本和访问权限必须单独保留。', steps: [
    ['文本', '清洗与结构化切分', '标题、表格与正文的边界决定检索单元。去重时不能把不同版本误合并。'],
    ['编码', '固定模型与预处理', '查询与文档使用兼容的编码器配置。更换模型通常需要重建索引。'],
    ['向量', '有序浮点数', '维度编号通常没有可直接命名的语义。维度多不自动意味着检索更准。'],
    ['相似度', '余弦或点积', '分数是模型与度量下的相关性线索，不是真实概率，也不能跨模型直接比较。'],
    ['过滤与返回', '权限、时间、来源', '授权约束须进入检索边界，返回原文定位；不能先把越权结果发给模型再让它忽略。'],
  ] },
  rag: { title: '从问题到可追溯回答', note: '离线索引是这条在线链路的前提；空证据、冲突与越权必须有显式分支。', steps: [
    ['权限', '确定可见集合', '由服务端认证得到用户身份，应用租户、文档 ACL 与生效时间约束。'],
    ['召回', '先找候选', '关键词与向量可以互补。相关文档根本没进入候选时，改生成提示词无济于事。'],
    ['重排', '把证据放前面', '对问题与候选联合评分，去重并控制预算；不要把相关度当事实正确率。'],
    ['证据', '原文与引用 ID', '绑定版本、页码或标题路径。把事实材料与指令分开，保留截断记录。'],
    ['生成与校验', '回答、引用或拒答', '验证引用存在且支持主张；没有充分证据时拒答或说明冲突，而不是补写。'],
  ] },
  agent: { title: '受限 Agent 的决策循环', note: '执行后回到观察，直到完成、失败、超时或预算耗尽；不是无限循环。', steps: [
    ['观察', '读取任务与状态', '只把任务需要的历史、工具结果与证据放入上下文，区分可信指令和外部材料。'],
    ['提出调用', '模型生成动作', '模型输出工具名与结构化参数。这只是请求，不是已经执行。'],
    ['校验与授权', '程序决定可否执行', '检查参数、身份、作用域、审批与幂等键。提示词不是安全边界。'],
    ['执行', '受限工具运行', '限定超时、网络、文件范围与返回大小。重试写操作前必须确认副作用状态。'],
    ['回写或停止', '记录结果与预算', '保存工具结果、错误和审计信息。达到步数或时间上限必须停止并报告未完成部分。'],
  ] },
  multimodal: { title: '多模态系统的信息路径', note: '不同模型的媒体表示不同；这里是概念分层，不代表每个模型都采用同一架构。', steps: [
    ['原始媒体', '图像、音频、视频', '保留原文件、页面坐标与时间戳，处理权限、版权和敏感信息。'],
    ['分片与采样', 'patch / 帧 / 音频段', '分辨率与采样频率影响成本和可见细节。漏采样的信息不能靠生成可靠恢复。'],
    ['模态编码', '映射为特征', '视觉或音频编码器把输入变成表示；OCR 文本也可以作为额外的证据通道。'],
    ['融合与对齐', '连接不同表示', '训练使跨模态表示关联，或让语言模型接收视觉特征；对齐不等于事实验证。'],
    ['输出校验', '位置、数值、时间', '对金额、表格与时间信息使用原始媒体核验。生成逼真不等于记录真实。'],
  ] },
  deployment: { title: '模型适配到上线的工程路径', note: '不是每个项目都需要训练。先建立推理基线，只有确认瓶颈后才适配或压缩。', steps: [
    ['数据', '切分、许可、版本', '把训练、验证与最终测试隔离；保留脱敏、去重和许可记录。'],
    ['训练或适配', 'SFT / LoRA', '用行为样例更新参数，不要把需要频繁更新的业务事实全写入权重。'],
    ['压缩与校准', '量化、任务回归', '计算权重与 KV Cache 预算；量化后要重新测格式、工具调用与业务质量。'],
    ['服务推理', 'prefill 与 decode', '长输入的预填充和逐 token 解码是不同负载；批处理提高吞吐也可能增加排队延迟。'],
    ['压测与回归', '质量、成本、恢复', '固定输入输出分布与并发，观察 p95、错误率、显存和预算，再决定上线。'],
  ] },
  evaluation: { title: '评测是一个闭环，不是一个总分', note: '门禁与目标需要按业务风险定义；示意流程不提供通用及格线。', steps: [
    ['固定样本', '版本与分桶', '包含正常、无答案、越权、冲突和工具失败样例；隔离用于调参和最终测试的数据。'],
    ['分层指标', '检索、生成、动作', '给每个指标明确分子、分母和标注规则，区别“格式有效”和“事实正确”。'],
    ['失败归因', '定位责任层', '从原文解析到检索、上下文、生成逐层检查，不要看到错误就换模型。'],
    ['版本对比', '同题配对比较', '保存模型、提示、索引与工具版本，报告退步样本和成本变化，不只报均分。'],
    ['上线监控', '灰度、回滚、反馈', '线上权限泄漏和错误写入须独立监控；反馈经审查后回流到回归集。'],
  ] },
  ecosystem: { title: '扩展能力如何进入执行边界', note: 'Skill、Rule、Plugin 与 MCP 位于不同层，不能相互替代，也不自动授予权限。', steps: [
    ['Rule', '描述约束', '给模型项目约定；真正不能违反的条件还要由运行时强制执行。'],
    ['Skill', '加载任务方法', '用元数据发现、按需加载步骤与参考资料。涉及脚本时必须按代码审查。'],
    ['Plugin', '分发能力包', '安装可能引入命令、钩子或服务配置，需审核来源、版本与升级差异。'],
    ['MCP', '发现与调用协议', 'Host 通过 Client 连接 Server。工具描述是不可信输入，协议连接不等于业务授权。'],
    ['运行时', '统一授权与审计', '用服务端身份绑定资源范围，在执行前校验，在返回结果时继续检查敏感信息。'],
  ] },
}
const diagram = computed(() => maps[props.mode] ?? maps.learning)
const selected = ref(0)
const detailId = `ai-detail-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
</script>

<template>
  <figure class="ai-concept" :aria-label="diagram.title">
    <figcaption><strong>{{ diagram.title }}</strong><span>点击步骤查看机制与边界 · 概念示意，非性能数据</span></figcaption>
    <ol class="ai-concept__steps">
      <li v-for="(step, index) in diagram.steps" :key="step[0]">
        <button type="button" :aria-pressed="selected === index" :aria-controls="detailId" @click="selected = index">
          <span class="ai-concept__number">{{ index + 1 }}</span><strong>{{ step[0] }}</strong><small>{{ step[1] }}</small>
        </button>
      </li>
    </ol>
    <p :id="detailId" class="ai-concept__detail" aria-live="polite"><strong>{{ diagram.steps[selected][0] }}：</strong>{{ diagram.steps[selected][2] }}</p>
    <p class="ai-concept__note">{{ diagram.note }}</p>
    <details><summary>展开完整文字说明</summary><dl><template v-for="step in diagram.steps" :key="step[0]"><dt>{{ step[0] }} · {{ step[1] }}</dt><dd>{{ step[2] }}</dd></template></dl></details>
  </figure>
</template>

<style scoped>
.ai-concept { margin: 24px 0; padding: 18px; border: 1px solid var(--blog-border, var(--vp-c-divider)); border-radius: 12px; background: var(--blog-panel, var(--vp-c-bg-soft)); color: var(--vp-c-text-1); }
.ai-concept figcaption { display: grid; gap: 4px; margin-bottom: 16px; }
.ai-concept figcaption span, .ai-concept__note, .ai-concept small { color: var(--vp-c-text-2); font-size: 12px; line-height: 1.6; }
.ai-concept .ai-concept__steps { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 18px; padding: 0; margin: 0; list-style: none; }
.ai-concept__steps li { position: relative; margin: 0; min-width: 0; }
.ai-concept__steps li + li::before { content: '→'; position: absolute; left: -17px; top: 45%; color: var(--vp-c-text-2); }
.ai-concept button { width: 100%; height: 100%; min-height: 108px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 10px 5px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg); color: var(--vp-c-text-1); cursor: pointer; font-size: 13px; }
.ai-concept button[aria-pressed='true'] { border: 2px solid currentColor; padding: 9px 4px; }
.ai-concept button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.ai-concept__number { font-size: 11px; color: var(--vp-c-text-2); }
.ai-concept .ai-concept__detail { margin: 14px 0 8px; font-size: 14px; line-height: 1.8; }
.ai-concept .ai-concept__note { margin: 0; }
.ai-concept details { margin-top: 12px; font-size: 13px; }
.ai-concept summary { cursor: pointer; }
.ai-concept dt { font-weight: 600; margin-top: 10px; }
.ai-concept dd { margin-left: 0; color: var(--vp-c-text-2); }
@media (max-width: 640px) { .ai-concept .ai-concept__steps { grid-template-columns: 1fr; gap: 16px; } .ai-concept button { min-height: 54px; flex-direction: row; flex-wrap: wrap; gap: 8px; padding: 10px; } .ai-concept button[aria-pressed='true'] { padding: 9px; } .ai-concept__steps li + li::before { content: '↓'; left: 50%; top: -20px; } }
@media (forced-colors: active) { .ai-concept, .ai-concept button { background: Canvas; border-color: CanvasText; color: CanvasText; } }
</style>
