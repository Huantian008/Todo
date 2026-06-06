# 多 AI 协作使用指南

> 权威入口：`CLAUDE.md`。本文件是“怎么调用不同 AI”的操作手册与示例，可能随代码演进而过期。

## 🤖 已配置的 AI 模型

| AI 角色 | CLI 工具 | 默认模型 | 版本 | 职责范围 |
|---------|----------|----------|------|----------|
| **后端开发** | `codex` | `gpt-5.3-codex` | 5.3 | Express.js, API, 数据库, 测试 |
| **前端开发** | `gemini` | `gemini-3-flash-preview` | 3 Flash Preview | React, TypeScript, UI, 样式 |
| **产品经理** | `claude` | `claude-sonnet-4-5` | 4.5 | 架构, 集成, 文档, 审查 |

---

## 🚀 快速使用

### 方式 1：通过 Claude（我）自动调用

您只需告诉我任务，我会自动调用正确的 AI：

```bash
# 示例 1：后端任务（自动调用 Codex 5.3）
"帮我实现 Todo 优先级功能的后端 API"
→ Claude 会调用：codex exec -m gpt-5.3-codex [任务]

# 示例 2：前端任务（自动调用 Gemini 3）
"帮我设计一个漂亮的 Todo 优先级选择器组件"
→ Claude 会调用：gemini -p -m gemini-3-flash-preview [任务]

# 示例 3：集成任务（Claude 自己处理）
"审查前后端 API 对接，修复类型不匹配"
→ Claude 直接执行
```

### 方式 2：手动指定 AI

您也可以明确指定使用哪个 AI：

```bash
# 明确指定 Codex 开发后端
"用 Codex 5.3 编写 Todo 优先级的单元测试"

# 明确指定 Gemini 开发前端
"用 Gemini 3 实现优先级筛选功能"

# 明确指定 Claude 审查
"用 Claude 审查并修复前后端集成问题"
```

---

## 📋 当前 Todo App 项目待办任务

基于多 AI 分工的任务分配（示例模板；如与当前代码冲突，以 `CLAUDE.md` 为准）：

### 🔴 **高优先级（需要立即修复）**

#### 任务 #1: 修复前端 API 响应格式处理
- **负责 AI:** Gemini 3
- **状态:** ✅ 当前代码已统一按 `response.data.data` 读取 data 字段
- **涉及文件:** `frontend/src/components/App.tsx`
- **命令示例:**
  ```bash
  gemini -p -m gemini-3-flash-preview "检查并确保前端统一使用 response.data.data 读取后端返回的 data 字段（后端 envelope 为 { success, data }）。"
  ```

#### 任务 #2: 更新前端 TypeScript 接口
- **负责 AI:** Gemini 3
- **状态:** ✅ 当前 Todo 类型 `id` 为 string（UUID）
- **涉及文件:** `App.tsx`, `TodoList.tsx`, `TodoItem.tsx`
- **命令示例:**
  ```bash
  gemini -p -m gemini-3-flash-preview "检查并统一 Todo TypeScript 类型（id: string，字段与后端一致）。"
  ```

### 🟡 **中优先级**

#### 任务 #3: 编写后端单元测试
- **负责 AI:** Codex 5.3
- **目标:** 测试覆盖率 > 80%
- **状态:** ✅ 当前已有 `backend/tests/todo.test.js`
- **命令示例:**
  ```bash
  codex exec -m gpt-5.3-codex "补充/完善 backend/tests/todo.test.js（边界场景、稳定性、覆盖率）。"
  ```

#### 任务 #4: 创建环境配置文件
- **负责 AI:** Codex 5.3
- **状态:** ✅ 当前已有 `backend/.env`
- **可选增强:** 增加 `backend/.env.example`
- **命令示例:**
  ```bash
  codex exec -m gpt-5.3-codex "新增 backend/.env.example（PORT=3001 等），并在 CLAUDE.md 中说明。"
  ```

### 🟢 **低优先级（最后完成）**

#### 任务 #5: 测试前后端集成
- **负责 AI:** Claude (我)
- **操作:** 启动服务器，测试所有功能

#### 任务 #6: 编写项目文档
- **负责 AI:** Claude (我)
- **状态:** ✅ 当前已有 `README.md`，并以 `CLAUDE.md` 为单一权威入口

---

## 🎯 执行任务的三种方式

### 方式 A：让 Claude 自动编排（推荐）

只需告诉我任务，我会自动调用合适的 AI：

```
用户: "修复任务 #1 和 #2"
Claude:
1. 分析任务（前端相关）
2. 调用 gemini -p -m gemini-3-flash-preview
3. 审查修复结果
4. 报告完成情况
```

### 方式 B：手动指定 AI

您可以明确指定：

```
用户: "让 Gemini 3 修复任务 #1"
Claude: 调用 gemini -p -m gemini-3-flash-preview [具体任务]

用户: "让 Codex 5.3 完成任务 #3"
Claude: 调用 codex exec -m gpt-5.3-codex [具体任务]
```

### 方式 C：直接使用命令行

您也可以在终端直接使用：

```bash
# 在项目根目录
cd E:\Project Exercise\todo-app-multiai

# 使用 Codex 5.3 开发后端
codex exec -m gpt-5.3-codex "编写后端测试"

# 使用 Gemini 3 开发前端（默认 Flash）
gemini -p -m gemini-3-flash-preview "修复/调整前端 API 对接"
```

---

## 📖 完整命令参考

### Codex 5.3 命令

```bash
# 基本命令
codex exec -m gpt-5.3-codex "任务描述"

# 指定工作目录
codex exec -m gpt-5.3-codex --cwd backend/ "任务描述"

# 查看可用模型
codex models

# 查看帮助
codex --help
```

### Gemini 3 命令（默认 Flash）

```bash
# 基本命令（非交互模式）
gemini -p -m gemini-3-flash-preview "任务描述"

# 自动批准所有操作
gemini -p -y -m gemini-3-flash-preview "任务描述"

# 恢复之前的会话
gemini -r [session-id] -m gemini-3-flash-preview

# 查看可用模型
gemini models

# 查看帮助
gemini --help
```

---

## 🔄 典型工作流程示例

### 场景：添加 Todo 优先级功能

#### 步骤 1：需求分析（Claude）
```
用户: "添加 Todo 优先级功能（高/中/低）"
Claude:
- 分析需求
- 拆分为后端和前端任务
- 创建任务清单
```

#### 步骤 2：后端实现（Codex 5.3）
```bash
# Claude 自动调用：
codex exec -m gpt-5.3-codex "在 backend/src/models/todo.model.js 中添加 priority 字段（默认 'medium'），更新控制器支持优先级"
```

#### 步骤 3：前端实现（Gemini 3）
```bash
# Claude 自动调用：
gemini -p -m gemini-3-flash-preview "在 Todo 接口中添加 priority: 'high' | 'medium' | 'low'，在 TodoItem 组件中显示优先级徽章"
```

#### 步骤 4：集成测试（Claude）
```bash
# Claude 自己执行：
1. 启动后端：cd backend && npm start
2. 启动前端：cd frontend && npm run dev
3. 测试优先级功能
4. 验证 API 响应
5. 更新文档
```

---

## ✅ 验证配置

您的配置文件已更新为：

**文件路径:** `C:\Users\y2003\.claude\multi-ai-config.json`

```json
{
  "workers": {
    "codex": {
      "defaultModel": "gpt-5.3-codex",
      "modelVersion": "5.3"
    },
    "gemini": {
      "defaultModel": "gemini-3-flash-preview",
      "modelVersion": "3-flash-preview"
    }
  }
}
```

以后调用这两个模型时，会**自动使用这些默认版本**。

---

## 🎯 立即开始

现在您可以直接告诉我：

1. **"开始修复任务 #1 和 #2"** - 我会调用 Gemini 3 修复前端 bug
2. **"让 Codex 编写后端测试"** - 我会调用 Codex 5.3 编写单元测试
3. **"测试整个应用"** - 我会启动前后端并测试集成

或者您可以手动使用命令行工具直接调用 Codex/Gemini。

---

**配置完成日期:** 2026-02-09
**维护者:** Claude (Product Manager)
**配置文件:** `C:\Users\y2003\.claude\multi-ai-config.json`
