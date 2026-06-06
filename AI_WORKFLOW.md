# 多 AI 协作工作流程

> 权威入口：`CLAUDE.md`。本文件描述协作流程与提示词模板。

## 🤖 AI 团队配置

| 角色 | AI 模型 | 版本 | 职责 |
|------|---------|------|------|
| 后端开发 | OpenAI Codex | 5.3 (默认) | Express.js, API, 测试 |
| 前端开发 | Google Gemini | 3 (Flash 默认) | React, TypeScript, UI |
| 产品经理 | Anthropic Claude | Opus 4.6 / Sonnet 4.5 | 架构, 集成, 文档 |

---

## 📋 工作流程

### 1. 后端开发（Codex 5.3）

**命令示例：**
```bash
# 在 ChatGPT / OpenAI Playground 中使用
Model: code-davinci-002 (Codex 5.3)
Context: "你是一个 Express.js 后端专家，负责 todo-app-multiai 项目的后端开发"
```

**任务清单：**
- [ ] 实现 API 端点
- [ ] 编写数据模型
- [ ] 创建控制器逻辑
- [ ] 编写单元测试（Jest + Supertest）
- [ ] API 文档更新

**输出规范：**
- 所有代码使用 CommonJS (require/module.exports)
- 遵循 Express.js 最佳实践
- 返回格式：`{ success: boolean, data: any, error?: string }`

---

### 2. 前端开发（Gemini 3，Flash 默认）

**命令示例：**
```bash
# 在 Google AI Studio / Gemini API 中使用
Model: gemini-3-flash-preview (fallback: gemini-3-pro-preview)
Context: "你是一个 React/TypeScript 前端专家，负责 todo-app-multiai 项目的前端开发"
```

**任务清单：**
- [ ] 设计 UI 组件
- [ ] 实现 React Hooks 状态管理
- [ ] 集成后端 API（Axios）
- [ ] Tailwind CSS 样式美化
- [ ] TypeScript 类型定义

**输出规范：**
- 使用 TypeScript + TSX
- 遵循 React 19 Hooks 最佳实践
- Tailwind CSS 用于所有样式
- 组件化设计（Header, AddTodo, TodoList, TodoItem）

---

### 3. 集成与审查（Claude Opus/Sonnet）

**命令示例：**
```bash
# 在 Claude Code CLI 中使用
Model: claude-sonnet-4-5 (或 claude-opus-4-6)
Context: "作为产品经理，审查并修复前后端集成问题"
```

**任务清单：**
- [ ] 审查前后端 API 对接
- [ ] 修复类型不匹配问题
- [ ] 运行集成测试
- [ ] 编写项目文档
- [ ] 代码质量检查

---

## 🔄 协作场景示例

### 场景 1: 添加新功能

1. **产品定义（Claude）**
   ```
   需求：添加 Todo 优先级功能（高/中/低）
   - 更新数据模型
   - 修改 API
   - 更新 UI
   ```

2. **后端实现（Codex 5.3）**
   ```javascript
   // 由 Codex 实现
   class Todo {
     constructor(title, description, priority = 'medium') {
       // ...
       this.priority = priority; // 新增字段
     }
   }
   ```

3. **前端实现（Gemini 3）**
   ```typescript
   // 由 Gemini 实现
   interface Todo {
     id: string;
     title: string;
     priority: 'high' | 'medium' | 'low'; // 新增字段
   }
   ```

4. **集成测试（Claude）**
   - 测试 API 响应
   - 验证 UI 显示
   - 更新文档

---

### 场景 2: 修复 Bug

1. **发现问题（任何 AI）**
   ```
   Bug: 前端 Todo.id 类型是 number，后端是 string (UUID)
   ```

2. **分配任务（Claude）**
   - Gemini: 修改 TypeScript 接口
   - Codex: 确认后端返回格式
   - Claude: 审查修复结果

3. **并行修复**
   - Gemini 3: 更新所有 `interface Todo { id: string }`
   - Codex 5.3: 验证 UUID 生成逻辑
   - Claude: 测试修复后的集成

---

## 🎯 最佳实践

### ✅ DO（推荐做法）

- **明确职责边界**：Codex 只改 backend/, Gemini 只改 frontend/
- **统一接口规范**：Claude 定义 API 契约，两边遵守
- **及时沟通**：每次改动记录在对应的 AI 会话中
- **版本控制**：每个 AI 的工作提交独立的 commit

### ❌ DON'T（避免做法）

- Codex 不应修改前端代码
- Gemini 不应修改后端逻辑
- 不要在一个 AI 会话中混合前后端开发
- 避免未经 Claude 审查就合并代码

---

## 📝 提示词模板

### 给 Codex 5.3 的提示词
```
你是 todo-app-multiai 项目的后端专家（使用 Codex 5.3）。

当前任务：[具体任务描述]

项目信息：
- 框架：Express.js + Node.js
- 数据库：内存存储（Map）
- API 规范：RESTful
- 返回格式：{ success: boolean, data: any }

请实现 [功能]，确保：
1. 遵循现有代码风格
2. 添加适当的错误处理
3. 编写对应的测试用例
```

### 给 Gemini 3 的提示词（Flash 默认）
```
你是 todo-app-multiai 项目的前端专家（使用 Gemini 3，默认 gemini-3-flash-preview；必要时才用 gemini-3-pro-preview）。

当前任务：[具体任务描述]

项目信息：
- 框架：React 19 + TypeScript
- 样式：Tailwind CSS
- 状态管理：React Hooks
- API 地址：http://localhost:3001/api/todos

请实现 [功能]，确保：
1. TypeScript 类型严格定义
2. 使用函数式组件 + Hooks
3. Tailwind CSS 实现美观 UI
4. 响应式设计
```

### 给 Claude 的提示词
```
作为 todo-app-multiai 项目的产品经理（Claude Opus/Sonnet）。

当前任务：审查并集成前后端代码

检查清单：
- [ ] API 响应格式是否匹配
- [ ] TypeScript 类型定义是否正确
- [ ] 前后端数据模型是否一致
- [ ] 错误处理是否完善
- [ ] 文档是否需要更新

请执行集成测试并修复发现的问题。
```

---

## 🚀 快速开始示例

### 完整开发流程演示

**任务：添加 Todo 标签（Tags）功能**

#### Step 1: 需求分析（Claude）
```markdown
需求：支持为每个 Todo 添加多个标签
- 数据模型：tags: string[]
- API：POST 时可以传入 tags 数组
- UI：显示标签，支持点击筛选
```

#### Step 2: 后端开发（Codex 5.3）
```bash
Prompt to Codex:
"修改 backend/src/models/todo.model.js，在 Todo 类中添加 tags 字段（默认空数组）。
确保在 update() 方法中也支持更新 tags。"
```

#### Step 3: 前端开发（Gemini 3）
```bash
Prompt to Gemini:
"修改 frontend/src/components/App.tsx 和 TodoItem.tsx：
1. 在 Todo interface 中添加 tags?: string[]
2. 在 TodoItem 组件中显示标签（使用 Tailwind 样式）
3. 添加标签筛选功能"
```

#### Step 4: 集成测试（Claude）
```bash
# Claude 执行
1. 启动后端：cd backend && npm start
2. 启动前端：cd frontend && npm run dev
3. 测试创建带标签的 Todo
4. 验证标签显示和筛选
5. 更新 API 文档
```

---

**最后更新：** 2026-02-09
**维护者：** Claude (Product Manager)
