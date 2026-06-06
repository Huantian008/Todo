# Today's Todo

一个重构后的全栈今日 Todo 应用。后端使用 Go + Gin，数据持久化到 MongoDB；前端使用 React + TypeScript + Vite + Tailwind CSS，并通过高德地图 Web 服务展示本地今日天气。页面背景和毛玻璃 UI 会随天气状态动态变化。

## 技术栈

- 后端：Go + Gin
- 数据库：MongoDB
- 前端：React 19 + TypeScript + Vite + Tailwind CSS 4
- HTTP 客户端：Axios
- 天气服务：高德地图逆地理编码和天气查询 API
- 本地数据库容器：Docker Compose

## 快速开始

### 1. 数据库设置

确保您的 MongoDB 在本地的 `27017` 端口运行，或者通过 Docker 启动数据库容器：

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

## API

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

## 验证与测试

运行 Go 后端单元测试和集成测试：

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
