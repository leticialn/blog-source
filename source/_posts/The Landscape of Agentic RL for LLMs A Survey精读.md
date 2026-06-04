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
- 汇总仓库链接：https://github.com/xhyumiracle/Awesome-AgenticLLM-RL-Papers，https://huggingface.co/papers/2509.02547
- 参考博客：https://hub.baai.ac.cn/view/49404

## 研究问题

论文系统性梳理了“大模型智能体（LLM Agent） + 强化学习（RL）”这一新兴方向。以往的研究主要集中于传统的“偏好驱动强化微调”（PBRFT，如RLHF、DPO等），它们本质上是单步决策，针对静态数据上的文本输出做偏好优化。

而本篇综述致力于定义并形式化**Agentic Reinforcement Learning (Agentic RL)**这一新范式：将大语言模型（LLM）作为嵌入动态环境中的策略（policy），在部分可观测（POMDP）、长时序交互中，通过RL学习规划、工具调用、记忆和自反思等智能体行为，解决从“静态文本回答器”向“通用自主智能体”转变的理论构建与分类体系问题。

## 核心方法

论文从“形式化对比”、“能力维度”和“任务维度”三个层面对 Agentic RL 进行了系统提炼：

1. **形式化转变 (PBRFT vs Agentic RL)**
   - **传统 PBRFT**：退化为单步 MDP。状态空间 $S_{trad} = \{\text{prompt}\}$，时间跨度 $T = 1$，状态转移是确定的。奖励函数是对整段回答的单个标量评分 $R_{trad}(s_0, a) = r(a)$。目标是最大化期望奖励 $J_{trad}(\theta) = \mathbb{E}_{a\sim\pi_\theta}[r(a)]$。
   - **Agentic RL**：建模为部分可观测马尔可夫决策过程 (POMDP)。存在真实世界状态 $s_t$ 与观测 $o_t = O(s_t)$，时间跨度 $T > 1$。动作空间分为文本动作 $A_{text}$ 和环境动作 $A_{action}$（如触发工具调用的 `<search>` 等特定标记）。状态转移是动态的 $s_{t+1}\sim P(s_{t+1}|s_t,a_t)$。奖励函数既有任务终点稀疏奖励，也有每步子奖励，目标是最大化折扣累计回报 $J_{agent}(\theta)=\mathbb{E}_\tau[\sum_t \gamma^t R_{agent}(s_t,a_t)]$。
   - 算法支撑：探讨了 REINFORCE、PPO、DPO、GRPO 等算法在 Agentic 场景下的适配与变体（如 Step-wise DPO/GRPO 改善信用分配）。

2. **能力维度分类**
   - **规划 (Planning)**：RL 用作外部向导微调价值/启发式函数指导搜索树（如MCTS），或者直接作为内部驱动以端到端方式微调LLM本身的规划策略。
   - **工具使用 (Tool Use)**：RL 将“是否/何时/如何调用工具”作为动作决策变量进行端到端优化，学会自我纠错与工具选择。
   - **记忆 (Memory)**：将记忆管理（插入、删除、抽象等）从手工规则转化为可学习策略（Token级显式/潜在记忆、结构化记忆图谱）。
   - **自我改进 (Self-improvement)**：通过交互轨迹反馈将自我反思（口头自我纠错）和策略梯度更新结合。

3. **任务应用维度**
   - 整理了 Agentic RL 在搜索 (Search)、代码 (Code)、数学 (Math)、GUI、多模态具身 (Embodied) 以及多智能体 (Multi-Agent) 等场景的具体实现。

## 实验结论

作为 Survey 论文，本文未进行新实验，而是对已有大量工作进行了分类归纳：
- **算法对比 (Table 2)**：对比了 PPO、DPO、GRPO 等数十种在大模型对齐与 Agent 训练中的变体，总结了其目标函数、KL惩罚和奖励粒度（Token-level / Step-wise / Trajectory-level）。
- **能力建模对比 (Table 3等)**：整理了各种记忆管理模型、工具学习策略和规划优化方法的优劣与适用场景。
- **环境基准整理 (Section 5)**：汇总了开源的实验环境（如 WebArena、OSWorld、SWE-bench 等）与当前的主流强化学习训练框架，指明了当下评估 Agentic RL 的基础设施。

## 优点与不足

### 优点
1. **理论边界清晰**：用简洁的数学公式形式化了 LLM 偏好微调 (PBRFT) 与 Agentic RL (POMDP) 的差异，厘清了许多概念上的模糊。
2. **分类体系科学**：采用“能力”与“任务”双轴建模，技能树与地图副本的对应关系十分直观。
3. **前瞻性高**：对结构化记忆的强化学习演化、长链条工具调用的信用分配（Credit Assignment）等前沿方向给出了明确的指引。

### 不足
1. **深度细节有所取舍**：因为覆盖面极广，部分细分算法的具体公式与参数对齐机制需要读者自行查阅原论文。
2. **机理分析尚浅**：对于“RL 到底在 LLM 内部学到了什么结构”的本质解释较少，主要偏向于工程实现与算法分类的整理。

## 值得借鉴的点

- **POMDP 形式化定义**：在撰写相关论文时，可以用文中 $A_{agent}=A_{text}\cup A_{action}$ 的定义来描述智能体既有内部思考 token 又有外部操作标记的混合动作空间。
- **Step-wise 优化思路**：Table 2 整理的多步信用分配、过程奖励（Process Reward）及组内相对奖励（GRPO）是解决长序列决策 hacking 问题的直接参考设计。

## 我的思考

和自己课题的关联。

这篇综述为我的研究提供了极佳的路线图。如果我后续的博士课题或研究方向落在“大模型决策”上，以下几点极具启发性：

> 这篇论文对我后续研究的启发是：
> 1. **结构化记忆的管理策略**：目前大部分 RAG 或 Graph-based 记忆依然采用启发式检索与清洗规则。如果将图的拓扑修改（连边、删除、实体抽象）视为 POMDP 动作空间，使用 RL 来学习如何记忆与遗忘，会是一个理论完备且实用性极强的研究方向。
> 2. **长时序工具调用的信用分配**：在 Code Agent 或 GUI 自动化中，很多步工具调用都是无意义甚至有害的。基于 Step-level advantage 的信用分配（例如改进版 Step-GRPO）是打破 Trajectory-level 稀疏奖励瓶颈的关键，可以作为算法层面的突破点。
> 3. **外部搜索与内部策略的结合**：探索如何让 LLM 在生成时动态决定“何时调用 MCTS 深度规划，规划多深”，将直觉式快速思考与串行推理进行 RL 协同训练。
