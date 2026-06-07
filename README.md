# Today's Todo ✨ Ambient Focus Edition

一个追求极致视觉体验与交互手感的全栈今日 Todo 应用。

在保留了“天气影响心情”的浪漫设定的基础上，我们对其前端界面进行了代号为 **"Ambient Focus" (氛围专注)** 的深度重构。应用不仅在后端使用了高性能的 Go + Gin 与 MongoDB 组合，更在前端将 UI 质感与交互体验推向了极致。

---

## 🌟 全新设计特色 (Ambient Focus UI)

我们深信：**优秀的工具不应该喧宾夺主，而是要在极致的静谧中为你提供氛围感。**

### 1. 沉浸式环境光晕 (Mesh Gradients) ⛅️
我们抛弃了传统生硬的纯色天气背景。现在的页面底层是一个随本地天气动态渲染的 **弥散光晕 (Mesh Gradient)**：
- **晴天**：屏幕边缘会泛起如阳光倾洒般的琥珀色暖阳。
- **雨天**：则是深浅交织的冷调蓝光，仿佛雨水在玻璃窗上的折射。
- 光晕作为一种**环境光**存在于极简的白色卡片之下，既让你感知到窗外的气候，又绝不会干扰你对任务的专注。

### 2. 物理级丝滑交互 (Spring Physics) ⚡️
为了让每一次点击都充满反馈感，我们在应用中注入了非线性的弹簧物理曲线 (`cubic-bezier(0.34, 1.56, 0.64, 1)`)：
- **按钮回弹**：无论是添加任务、切换过滤条件，还是点击完成，所有的按钮按下和松开都会带有真实的 Q 弹缩放反馈。
- **磁性悬浮**：光标移动到待办卡片上时，卡片会伴随微小的放大 (`scale: 1.01`) 与上移 (`-1px`)，同时底部投射出深邃的阴影，仿佛卡片受到磁力吸引向你贴近。

### 3. 空间层级重排 (FLIP Animations) 🚀
不再有生硬的任务跳动！当你勾选或取消一个任务时，它会自动在列表中重新排序：
- **Z-Index 提权跃升**：移动中的卡片会像实物一样，飞跃**高于**其他卡片的空间层级（Z 轴）。
- **丝滑归位**：长达 600ms 的弹性过渡动画，让卡片在列表间穿梭、归位的过程变成一种视觉享受。

### 4. 极简英雄头部 (Hero Header) 🏆
去除了冗余的侧边栏。巨大的当期日期占据视觉主导，而天气数据（图标、温度、地点）与你的进度统计，化作了极其精致的胶囊药丸 (Pill) 样式，融入到头部的右上角。页面现在是 100% 居中且专注于你的待办列表的。

---

## 🛠 技术栈

- **后端**：Go + Gin (RESTful API)
- **数据库**：MongoDB (经由 Docker Compose 管理)
- **前端**：React 19 + TypeScript + Vite + Tailwind CSS 4
- **天气服务**：高德地图逆地理编码和天气查询 API

## 🚀 快速开始

### 1. 数据库设置

确保您的 MongoDB 在本地的 `27017` 端口运行，或者通过 Docker 启动：

```bash
docker compose up -d mongodb
```

### 2. 后端设置

1. 配置您的环境变量文件：

   ```bash
   cd backend
   cp .env.example .env
   ```

2. 打开 `backend/.env` 并配置您的高德地图 API 密钥：

   ```env
   AMAP_KEY=你的高德地图API密钥
   ```

3. 启动 Go 服务：

   ```bash
   go run ./cmd/server
   ```
   后端服务将运行在 `http://localhost:3001`。

### 3. 前端设置

1. 在另一个终端会话中运行：

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. 在浏览器中打开 `http://localhost:5173`。

## 📡 API 文档

后端基础地址：`http://localhost:3001`

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | 健康检查 |
| GET | `/api/todos?date=YYYY-MM-DD` | 获取指定日期 Todo |
| GET | `/api/todos/:id` | 获取单个 Todo |
| POST | `/api/todos` | 创建 Todo |
| PUT | `/api/todos/:id` | 更新 Todo |
| DELETE | `/api/todos/:id` | 删除 Todo |
| GET | `/api/weather/today?lat=<lat>&lng=<lng>` | 根据浏览器定位获取今日天气 |

## 🧪 验证与测试

运行 Go 后端测试：

```bash
cd backend
go test ./...
```

运行前端类型检查与生产环境构建：

```bash
cd frontend
npm run typecheck
npm run build
```
