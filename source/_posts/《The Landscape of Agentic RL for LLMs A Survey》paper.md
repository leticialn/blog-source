---
title: The Landscape of Agentic RL for LLMs A Survey精读
date: 2026-06-04 23:20:53
categories:
  - 论文精读
tags:
  - 强化学习
  - 阅读笔记
---

## 论文信息

- 标题：The Landscape of Agentic Reinforcement Learning for LLMs: A Survey
- 作者：Keying Lu, Runji Lin, et al. (xhyumiracle等)
- 会议/期刊：**TMLR**（Transactions on Machine Learning Research）
- 年份：2025年
- 文章链接：https://doi.org/10.48550/arXiv.2509.02547
- 参考博客：https://hub.baai.ac.cn/view/49404

## 研究问题

- 论文系统性梳理了“大模型智能体（LLM Agent） + 强化学习（RL）”这一新兴方向。以往的研究主要集中于传统的“偏好驱动强化微调”（PBRFT，如RLHF、DPO等），它们本质上是单步决策，针对静态数据上的文本输出做偏好优化。而本篇综述致力于定义并形式化**Agentic Reinforcement Learning (Agentic RL)**这一新范式：**将大语言模型（LLM）作为嵌入动态环境中的策略（policy），在部分可观测（POMDP）、长时序交互中，通过RL学习规划、工具调用、记忆和自反思等智能体行为，解决从“静态文本回答器”向“通用自主智能体”转变的理论构建与分类体系问题。**

## 核心方法

- 从 LLM RL 到 Agentic RL 的形式化转变

  - PBRFT：单步 MDP。

    状态空间 $S_{trad} = \{\text{prompt}\}$，时间跨度 $T = 1$，状态集合基本就是一个 prompt 或少量上下文，可以视为单一状态 $s_0$ ，没有真正的状态演化。

  - Agentic RL：建模为部分可观测马尔可夫决策过程 (POMDP)。

    状态 $s_t$ 是环境的真实（可能隐藏）状态，Agent 只通过观测 $o_t$ 部分看到它，是一个 POMDP，时间跨度 $T > 1$。

    动作空间：文本动作 $A_{text}$ 和环境动作 $A_{action}$（如触发工具调用的 `<search>` 等特定标记）。

    状态转移：动态的 $s_{t+1}\sim P(s_{t+1}|s_t,a_t)$。

    奖励函数：既有任务终点稀疏奖励，也有每步子奖励，目标是最大化折扣累计回报 $J_{agent}(\theta)=\mathbb{E}_\tau[\sum_t \gamma^t R_{agent}(s_t,a_t)]$。

  - 算法支撑：探讨了 REINFORCE、PPO、DPO、GRPO 等算法在 Agentic 场景下的适配与变体。

- 能力维度分类

  - 规划（Planning）：RL 用作外部向导微调价值/启发式函数指导搜索树（如MCTS），或者直接作为内部驱动以端到端方式微调LLM本身的规划策略。

  - 工具使用（Tool Use）：RL 将“是否/何时/如何调用工具”作为动作决策变量进行端到端优化，学会自我纠错与工具选择。

  - 记忆（Memory）：将记忆管理（插入、删除、抽象等）从手工规则转化为可学习策略（Token级显式/潜在记忆、结构化记忆图谱）。

  - 自我改进（Self-improvement）、推理（Reasoning）和感知（Perception，多模态输入）：通过交互轨迹反馈将自我反思（口头自我纠错）和策略梯度更新结合。

- 任务应用维度
   - 搜索 / Research Agent
   - 代码 / SWE Agent
   - 数学 / 证明 Agent
   - GUI / 网页操作 / 软件自动化
   - 视觉 / 具身智能体（robotics）
   - 多智能体协作 / 博弈场景 等。

## 论文中一些表格简化速查

- **算法对比 (Table 2)**：对比了 PPO、DPO、GRPO 等数十种在大模型对齐与 Agent 训练中的变体，总结了其目标函数、KL惩罚和奖励粒度（Token-level / Step-wise / Trajectory-level）。

| 维度            | PPO 系（含 RLHF-PPO）mimuw+1                | DPO 系（含 IPO 等）huggingface+1   | GRPO 系（含 Step-GRPO）mimuw+2               |
| :-------------- | :------------------------------------------ | :--------------------------------- | :------------------------------------------- |
| 核心信号类型    | 显式 reward：环境 / reward model 分数       | 偏好对：只知道 A 比 B 好           | 显式 reward，但只用 group 内相对好坏         |
| 优化目标类型    | 策略梯度 + clipped surrogate                | 偏好优化，直接对策略分布施压       | 策略梯度 + group 相对 advantage              |
| 是否需要 critic | 需要 value/critic（actor–critic）           | 不需要 critic                      | 不需要 critic，用组内平均/排序当 baseline    |
| 是否用 clip     | 有 PPO 样式 clip（约束策略 ratio）          | 无 clip，主要靠 KL 约束参考模型    | 通常可带 clip，重点是 group 标准化           |
| 是否用 KL 约束  | 常用 KL regularization/early stop           | 明确有 KL（对 reference 模型）     | 可选 KL，一般不是核心                        |
| 奖励粒度        | 支持 step / episode 级 reward               | 通常是 trajectory/response 级偏好  | 可做 episode 或 step 级（Step-GRPO 等）      |
| 数据采样方式    | 偏向在线 / 近在线 RL                        | 偏向离线偏好数据（可配合少量在线） | 可离线（多候选打分）也可半在线               |
| 算法复杂度      | 高：要训练 actor + critic                   | 中：只优化 policy，无 critic       | 中：实现简单但要采样多个候选                 |
| 典型用途        | RLHF、环境型 RL（游戏、GUI、机器人）        | 风格/安全对齐，过程偏好对齐        | 数学、代码、推理，Agentic 任务中的多候选选择 |
| Agentic RL 优势 | 能利用真实 step reward 做 long-horizon 学习 | 用偏好监督轨迹质量，适合过程对齐   | 非常适合“多解可自动打分”的 Agentic 任务      |

- **能力建模对比 (Table 3等)**：整理了各种记忆管理模型、工具学习策略和规划优化方法的优劣与适用场景。

| 记忆类别              | 存储形式（Representation）                              | 典型操作（Write / Manage / Read）                            | RL 目前主要介入点                                            | 优点/适用场景                         | 主要不足 / 未来机会                                          |
| :-------------------- | :------------------------------------------------------ | :----------------------------------------------------------- | :----------------------------------------------------------- | :------------------------------------ | :----------------------------------------------------------- |
| RAG-style 记忆        | 向量库、文档库、知识库；embedding + 检索                | Write：写入新文档/片段  Manage：简单去重、容量限制  Read：相似度检索、kNN | 少数工作用 RL 学“何时检索、检索多少、如何构造查询”arxiv+2    | 实现最成熟，易接入现有 LLM 系统       | 写/管几乎全靠 heuristic，结构粗糙；RL 管理空间大arxiv+1      |
| Token-level 记忆      | 自然语言 token（显式笔记、总结）或 latent memory tokens | Write：何时生成记忆 token  Manage：保留/覆盖/压缩  Read：选哪些 token 注入上下文 | 多篇工作用 RL 决定“记不记、记多少、忘哪些”，有些还学 latent token 更新策略arxiv+2 | 贴近上下文窗口，易与现有 LLM 架构结合 | 动作空间仍较粗，长时序 credit 分配尚不成熟                   |
| 结构化记忆（图/层级） | 知识图、时间图、层级摘要树、笔记网络等结构化表示        | Write：增节点  Manage：建/改边、合并、抽象、删除  Read：图检索、子图选取 | 大部分工作仍是 heuristic；RL 管“图演化策略”目前几乎空白，被视为重要前景方向arxiv+2 | 表达能力强，适合长期、多任务知识组织  | 设计和训练复杂，是 Agentic RL + Memory 的高价值未开发区域arxiv+1 |

- **环境基准整理 (Section 5)**：
  - https://github.com/xhyumiracle/Awesome-AgenticLLM-RL-Papers
  - https://huggingface.co/papers/2509.02547


## 值得借鉴的点

- **书写方法：POMDP 形式化定义**：用 $A_{agent}=A_{text}\cup A_{action}$ 的定义来描述智能体既有内部思考 token 又有外部操作标记的混合动作空间。
- **Step-wise 优化思路**：Table 2 整理的多步信用分配、过程奖励（Process Reward）及组内相对奖励（GRPO）是解决长序列决策 hacking 问题的直接参考设计。

## 我的思考

- **长时序工具调用的信用分配**：在 Code Agent 或 GUI 自动化中，很多步工具调用都是无意义甚至有害的。基于 Step-level advantage 的信用分配（例如改进版 Step-GRPO）是打破 Trajectory-level 稀疏奖励瓶颈的关键。
- **外部搜索与内部策略的结合**：探索如何让 LLM 在生成时动态决定“何时调用 MCTS 深度规划，规划多深”，将直觉式快速思考与串行推理进行 RL 协同训练。
