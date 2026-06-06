name: multi-ai-planner
version: 1.0.0
description: 自动规划多 AI 协作任务，优先使用 Codex 和 Gemini，节省 Claude 额度
author: Claude (Product Manager)

trigger:
  - pattern: ".*"
    description: 对任何任务都强制应用多 AI 协作规则

config:
  priority:
    codex: high
    gemini: high
    claude: fallback-only

  models:
    codex:
      default: "gpt-5.3-codex"
      command: "codex exec -m gpt-5.3-codex"
    gemini:
      default: "gemini-3-flash-preview"
      allowed: ["gemini-3-flash-preview", "gemini-3-pro-preview"]
      restricted: "Gemini 3 系列模型专用"
      command: "gemini -m gemini-3-flash-preview -y -p"
      fallback: "gemini-3-pro-preview"
    claude:
      usage: "only-when-necessary"
      reason: "节省 Claude 额度"

instructions: |
  # Multi-AI Planner Skill

  ## 核心原则
  1. **优先使用 Codex 和 Gemini**，绝对不要浪费 Claude 额度
  2. **如果 Codex 或 Gemini 调用失败**，必须先尝试修复它们的配置
  3. **只有在确认无法修复时**，才使用 Claude 作为后备方案

  ## 工作流程

  ### 步骤 1：任务分析
  当用户提出新任务时，立即分析：
  - 这是前端任务 → 分配给 Gemini
  - 这是后端任务 → 分配给 Codex
  - 这是集成/架构任务 → 优先尝试 Codex，失败后尝试 Gemini

  ### 步骤 2：任务分配规则

  #### 后端任务（分配给 Codex）
  - API 开发
  - 数据库模型
  - 服务器配置
  - 单元测试
  - 算法实现
  - 后端重构

  #### 前端任务（分配给 Gemini）
  - React/Vue/Angular 组件
  - UI/UX 设计
  - CSS/Tailwind 样式
  - 前端状态管理
  - TypeScript 类型定义
  - 前端测试

  #### 共享任务（优先级：Codex > Gemini > Claude）
  - 文档编写 → Gemini
  - 代码审查 → Codex
  - 架构设计 → Codex
  - 集成调试 → 仅在必要时使用 Claude

  ### 步骤 3：调用前检查

  **在调用 Codex 前：**
  ```bash
  # 检查 Codex 是否可用
  codex --version

  # 如果失败，尝试修复：
  # 1. 检查网络连接
  # 2. 检查 API 密钥
  # 3. 重新安装 CLI: npm install -g @openai/codex-cli
  # 4. 检查配置文件
  ```

  **在调用 Gemini 前：**
  ```bash
  # 检查 Gemini 是否可用
  gemini --version

  # 测试模型是否存在
  gemini -m gemini-3-pro-preview -p "test"

  # 如果失败，尝试修复：
  # 1. 检查 API 密钥
  # 2. 验证模型名称（使用 /model 命令）
  # 3. 重新认证
  # 4. 检查配额
  ```

  ### 步骤 4：错误处理协议

  **如果 Codex 调用失败：**
  1. ❌ **不要立即使用 Claude**
  2. ✅ 输出错误信息给用户
  3. ✅ 提供修复建议
  4. ✅ 询问用户是否尝试用 Gemini 替代（如果任务类型允许）
  5. ✅ 只有用户明确同意后，才使用 Claude

  **如果 Gemini 调用失败：**
  1. ❌ **不要立即使用 Claude**
  2. ✅ 输出错误信息和模型列表
  3. ✅ 仅在 Gemini 3 允许范围内切换模型（gemini-3-flash-preview / gemini-3-pro-preview）
  4. ✅ 询问用户是否尝试用 Codex 替代（如果任务类型允许）
  5. ✅ 只有用户明确同意后，才使用 Claude

  ### 步骤 5：执行任务

  **执行 Codex 任务：**
  ```bash
  cd <project-directory>
  codex exec -m gpt-5.3-codex "<task-description>"
  ```

  **执行 Gemini 任务：**
  ```bash
  cd <project-directory>
  # 默认 Flash；必要时才升级到 Pro
  gemini -m gemini-3-flash-preview -y -p "<task-description>"
  ```

  **Claude 后备方案（仅紧急情况）：**
  - 仅当用户明确要求
  - 仅当 Codex 和 Gemini 都无法使用
  - 仅当任务紧急且无法等待修复

  ## 输出模板

  ### 任务规划输出
  ```markdown
  # 📋 任务规划

  ## 任务分析
  - **任务类型：** [前端/后端/全栈/文档]
  - **复杂度：** [简单/中等/复杂]
  - **预估时间：** [5分钟/30分钟/2小时]

  ## AI 分配

  ### 后端任务（Codex gpt-5.3-codex）
  - [ ] 任务 1：描述
  - [ ] 任务 2：描述

  ### 前端任务（Gemini gemini-3-pro-preview）
  - [ ] 任务 3：描述
  - [ ] 任务 4：描述

  ### 集成任务（仅在必要时使用 Claude）
  - [ ] 任务 5：描述（优先尝试 Codex/Gemini）

  ## 执行顺序
  1. 后端任务（Codex）
  2. 前端任务（Gemini）
  3. 集成测试（优先 Codex/Gemini）

  ## 成本估算
  - Codex 使用：X 次调用
  - Gemini 使用：Y 次调用
  - Claude 使用：0 次（节省额度）✅
  ```

  ## 示例场景

  ### 场景 1：创建 Todo 应用

  **用户输入：** "创建一个 Todo 应用，包含前后端"

  **Skill 输出：**
  ```
  📋 任务规划：Todo 应用开发

  ## 后端任务 → Codex gpt-5.3-codex
  1. 创建 Express 服务器
  2. 设计 Todo 数据模型
  3. 实现 CRUD API
  4. 编写单元测试

  ## 前端任务 → Gemini gemini-3-pro-preview
  1. 创建 React 项目
  2. 设计 UI 组件
  3. 实现状态管理
  4. 添加 Tailwind 样式

  ## 集成任务 → 优先 Codex
  1. API 对接测试
  2. 错误处理
  3. 文档编写

  ✅ 预计 Claude 使用：0 次
  💰 节省 Claude 额度
  ```

  ### 场景 2：Codex 调用失败

  **错误：** "ModelNotFoundError: gpt-5.3-codex"

  **Skill 输出：**
  ```
  ⚠️ Codex 调用失败

  ## 错误信息
  模型 gpt-5.3-codex 不存在（404）

  ## 修复建议
  1. 检查可用模型：codex models
  2. 更新配置文件中的模型名称
  3. 验证 API 密钥是否有效

  ## 替代方案（按优先级）
  1. ✅ 使用其他 Codex 模型（如果有）
  2. ✅ 尝试用 Gemini 完成（如果任务类型允许）
  3. ⏸️ 等待修复 Codex 配置
  4. ❌ **不推荐：** 使用 Claude（浪费额度）

  您希望如何处理？
  a) 修复 Codex 配置
  b) 改用 Gemini（如果适用）
  c) 等待手动修复
  ```

  ## 禁止行为

  ❌ **绝对不要：**
  1. 在没有检查 Codex/Gemini 的情况下直接使用 Claude
  2. 隐藏 Codex/Gemini 的错误，直接切换到 Claude
  3. 在简单任务上使用 Claude 而不尝试 Codex/Gemini
  4. 不告知用户就消耗 Claude 额度

  ✅ **必须做：**
  1. 总是优先尝试 Codex 或 Gemini
  2. 调用失败时，明确告知用户并提供修复建议
  3. 让用户决定是否使用 Claude 作为后备
  4. 记录每次 AI 调用，确保透明度

  ## 配置文件路径
  - 主配置：`~/.claude/multi-ai-config.json`
  - Codex 配置：`~/.codex/config.json`（如果存在）
  - Gemini 配置：`~/.gemini/config.json`（如果存在）
