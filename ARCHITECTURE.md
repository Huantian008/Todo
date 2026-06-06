# Todo App - 架构设计文档

**项目类型：** 全栈 Web 应用
**架构师：** Claude (Product Manager)
**开发团队：** Codex 5.3 (后端) + Gemini 3 (前端)

> 💡 **权威入口：** `CLAUDE.md`（保证与当前代码一致）。本文件为补充说明。

---

## 🏗️ 技术栈

### 后端 (Codex 负责)
- **框架：** Express.js (Node.js)
- **存储：** 内存 Map（当前实现，重启即清空）
- **数据库（可选扩展）：** SQLite / MongoDB（尚未在当前代码中启用）
- **API：** RESTful API
- **测试：** Jest + Supertest

### 前端 (Gemini 负责)
- **框架：** React 19 + TypeScript + Vite
- **样式：** Tailwind CSS
- **状态管理：** React Hooks (useState, useEffect)
- **HTTP 客户端：** Axios

### 开发工具
- **包管理：** npm
- **代码规范：** ESLint + Prettier
- **版本控制：** Git

---

## 📁 项目结构

```
todo-app-multiai/
├── backend/                    # Codex 负责
│   ├── src/
│   │   ├── models/
│   │   │   └── todo.model.js   # Todo 数据模型
│   │   ├── routes/
│   │   │   └── todo.routes.js  # API 路由
│   │   ├── controllers/
│   │   │   └── todo.controller.js  # 业务逻辑
│   │   ├── db/
│   │   │   └── database.js     # 内存存储（Map）
│   │   └── server.js           # Express 服务器
│   ├── tests/
│   │   └── todo.test.js        # 单元测试
│   ├── package.json
│   └── .env
│
├── frontend/                   # Gemini 负责
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── App.tsx         # 主应用组件
│   │   │   ├── AddTodo.tsx     # 添加 Todo 表单
│   │   │   ├── Header.tsx      # 页面头部
│   │   │   ├── TodoList.tsx    # Todo 列表组件
│   │   │   └── TodoItem.tsx    # 单个 Todo 项
│   │   └── main.tsx            # 入口文件
│   ├── package.json
│   └── tailwind.config.js
│
├── ARCHITECTURE.md             # 本文件
├── README.md                   # 入口索引（指向 CLAUDE.md）
└── CLAUDE.md                   # 单一权威文档
```

---

## 🔄 API 端点设计

### Todo CRUD Operations

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/todos` | 获取所有 Todos |
| GET | `/api/todos/:id` | 获取单个 Todo |
| POST | `/api/todos` | 创建新 Todo |
| PUT | `/api/todos/:id` | 更新 Todo |
| DELETE | `/api/todos/:id` | 删除 Todo |

### 请求/响应格式

**Todo 数据模型：**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "completed": "boolean",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**POST /api/todos 请求示例：**
```json
{
  "title": "学习 React",
  "description": "完成 React 官方教程"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "学习 React",
    "description": "完成 React 官方教程",
    "completed": false,
    "createdAt": "2026-02-09T08:16:00.000Z"
  }
}
```

> 备注：`GET /api/todos` 还会额外返回 `count` 字段（见当前后端实现）。

---

## 🎨 UI/UX 设计要求

### 功能需求
1. ✅ 显示所有 Todo 项
2. ✅ 添加新 Todo
3. ✅ 标记 Todo 为完成/未完成
4. ✅ 编辑 Todo
5. ✅ 删除 Todo
6. ✅ 筛选（全部/未完成/已完成）

### 设计要求
- 🎨 现代简洁的 UI 设计
- 📱 响应式布局（支持移动端）
- ✨ 流畅的交互动画
- 🌈 美观的配色方案
- ♿ 良好的可访问性

---

## 🔀 工作流程

### Phase 1: 后端开发 (Codex 5.3)
1. 设置 Express 项目结构 ✅
2. 创建数据库模型 ✅
3. 实现 CRUD API 端点 ✅
4. 编写单元测试 ✅
5. 测试 API 功能 ✅

### Phase 2: 前端开发 (Gemini 3)
1. 创建 React 项目 ✅
2. 设计 UI 组件 ✅
3. 实现 API 集成 ✅
4. 添加样式和动画 ✅
5. 响应式优化 ✅

### Phase 3: 整合与部署 (Claude)
1. 代码审查
2. 前后端集成测试
3. 优化性能
4. 编写文档
5. 准备部署

---

## 🎯 成功标准

- ✅ 所有 CRUD 操作正常工作
- ✅ 前端界面美观且易用
- ✅ 后端测试覆盖率 > 80%
- ✅ 响应式设计在多设备正常显示
- ✅ API 响应时间 < 100ms
- ✅ 代码遵循最佳实践

---

**架构师签名：** Claude (Product Manager)
**批准日期：** 2026-02-09
**版本：** 1.0
