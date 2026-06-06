# Todo App - 架构设计文档

**项目类型：** 全栈 Web 应用
**架构师：** Claude (Product Manager)
**开发团队：** Codex 5.3 (后端) + Gemini 3 (前端)

> 💡 **权威入口：** `CLAUDE.md`（保证与当前代码一致）。本文件为补充说明。

---

## 🏗️ 技术栈

### 后端 (Codex 负责)
- **框架：** Go + Gin
- **存储：** MongoDB (通过 Go Mongo Driver 连接)
- **API 代理：** 逆地理编码与天气查询接口（代理高德 AMap Web 服务 API，避免前端泄露 Key）
- **测试：** testing (Go 原生测试框架，配合 httptest 与 Mock Repository 模拟环境)

### 前端 (Gemini 负责)
- **框架：** React 19 + TypeScript + Vite
- **样式：** Tailwind CSS 4
- **状态管理：** React Hooks (useState, useEffect, useMemo)
- **HTTP 客户端：** Axios
- **天气适配：** 使用 Geolocation API 取得坐标并调用后端接口，根据当前天气状况动态加载 CSS 氛围主题

### 开发工具
- **容器化：** Docker Compose (用于本地 MongoDB)
- **包管理：** npm (前端) + Go Modules (后端)
- **版本控制：** Git

---

## 📁 项目结构

```
todo-app-multiai/
├── README.md                          # 入口索引（指向 CLAUDE.md）
├── CLAUDE.md                          # 单一权威文档
├── ARCHITECTURE.md                    # 本文件
├── docker-compose.yml                 # 本地 MongoDB docker 容器服务
├── plan.md                            # 原始重构计划
│
├── backend/                           # Codex 负责
│   ├── cmd/
│   │   └── server/
│   │       └── main.go                # 入口函数，启动并优雅关闭 HTTP 服务器
│   ├── internal/
│   │   ├── config/
│   │   │   └── config.go              # 读取 env 配置变量
│   │   ├── db/
│   │   │   └── database.go            # 初始化并检测 MongoDB 数据库连接
│   │   ├── models/
│   │   │   ├── todo.go                # BSON 序列化与自定义 JSON 序列化的 Todo 模型
│   │   │   └── weather.go             # 规范化的天气数据结构模型
│   │   ├── repositories/
│   │   │   └── todo_repository.go     # 处理与 MongoDB 交互的 CRUD 接口层
│   │   ├── services/
│   │   │   └── weather_service.go     # 调用并处理高德地理/天气 API 数据
│   │   ├── handlers/
│   │   │   ├── todo_handler.go        # 处理 Todo API 交互与参数检验
│   │   │   └── weather_handler.go     # 处理前端天气查询代理接口
│   │   └── routes/
│   │       └── router.go              # 设置路由组与 CORS 跨域规则
│   └── tests/
│       └── todo_test.go               # Mock DB 与 httptest 接口测试
│
└── frontend/                          # Gemini 负责
    ├── src/
    │   ├── api/
    │   │   ├── todos.ts               # Todo API 请求客户端
    │   │   └── weather.ts             # 天气代理 API 请求客户端
    │   ├── components/
    │   │   ├── App.tsx                # 主页面，统筹天气及 Todo，响应式 Grid 布局
    │   │   ├── AddTodo.tsx            # 添加 Todo 项的表单组件
    │   │   ├── TodayHeader.tsx        # 顶部日历与进度头部组件
    │   │   ├── WeatherCard.tsx        # 展示今日地级市、温度及天气动画的卡片组件
    │   │   ├── TodoList.tsx           # Todo 列表容器（已实现 FLIP 动画）
    │   │   ├── TodoItem.tsx           # Todo 单项卡片（已实现完成状态过滤与淡出动画）
    │   │   └── EmptyState.tsx         # 今日 Todo 空状态美化展示组件
    │   ├── hooks/
    │   │   └── useGeolocation.ts      # 浏览器获取经纬度的 Custom Hook
    │   ├── types/
    │   │   ├── todo.ts                # TypeScript Todo 类型声明
    │   │   └── weather.ts             # TypeScript 天气类型与条件声明
    │   └── style.css                  # Tailwind v4 全局 CSS 与天气色彩覆盖规则
```

---

## 🔄 API 端点设计

### Todo CRUD Operations

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/todos` | 获取当前日期的 Todos (过滤条件 `?date=YYYY-MM-DD`) |
| GET | `/api/todos/:id` | 获取单个 Todo 详细信息 |
| POST | `/api/todos` | 创建新 Todo (强制要求 Title 且 taskDate 为 `YYYY-MM-DD`) |
| PUT | `/api/todos/:id` | 部分更新 Todo (如修改 Completed、Title 或 TaskDate) |
| DELETE | `/api/todos/:id` | 删除 Todo |

### Weather Proxy Service

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/weather/today` | 天气代理接口 (必须包含参数 `?lat=<纬度>&lng=<经度>`) |

---

## 🎨 天气氛围 UI 映射设计

前端根据 API 返回的标准化 `condition` 给外层主容器添加 class，并在 `style.css` 中重写 CSS 变量实现动态变色：

| 天气 condition | 氛围色系描述 | CSS 主题变量覆盖 |
|------|------|------|
| `sunny` | 温暖明亮，晨曦金黄 | 金黄至暖蓝渐变背景，暖黄强调色 |
| `cloudy` | 沉稳安静，阴天云层 | 灰白至冷静灰蓝，深灰色强调色 |
| `rainy` | 深邃雨夜，科技感雨丝 | 深蓝至靛青背景，青蓝色强调色 |
| `snowy` | 纯净冰雪，冬日白蓝 | 冰蓝至霜白背景，冰蓝色强调色 |
| `foggy` | 神秘薄雾，低对比灰调 | 雾白色至朦胧锌灰，中灰色强调色 |
| `default` | 宁静夜幕，原版 Nocturne 调 | 酷黑至深棕渐变背景，古铜铜金强调色 |

---

## 🎯 成功标准

- **功能持久化：** MongoDB 容器/服务成功连接，重启后 todos 仍可从数据库加载。
- **定位联动：** 浏览器定位成功时，准确呈现今日地级市与天气，背景色产生自然平滑的 800ms 过渡。
- **独立容错：** 若定位失败或未配置高德 key，显示友好的提示卡片，所有 Todo 功能正常工作，UI 回退到 Nocturne 原版主题。
- **测试通过：** 后端测试套件全部正常工作。
- **代码整洁：** TypeScript 无 compile 报错，Vite 编译生产打包零 warning/error。

---

**批准日期：** 2026-06-06
**版本：** 2.0
