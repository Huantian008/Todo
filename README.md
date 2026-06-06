# Nocturne - 结合天气变化的动态 Todo 应用

Nocturne 是一款全栈 Todo 网络应用程序，具有流畅的 FLIP 列表动画，以及能够根据您当地的天气状况（由高德地图 Web 服务 API 提供支持）动态更改背景渐变和 CSS 主题强调色的高端用户界面。

本项目是作为多 AI 协同开发实战练习的成果。

## 技术栈

- **后端:** Go + Gin
- **前端:** React 19 + TypeScript + Vite + Tailwind CSS 4
- **数据库:** MongoDB
- **代理服务:** 高德地图逆地理编码和天气查询 API（通过 Go 后端进行代理以保护 API 密钥）
- **容器化:** Docker Compose（用于本地运行 MongoDB 容器）

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

## 相关文档
- 参见 [CLAUDE.md](CLAUDE.md) 了解完整的开发命令、项目规范和 API 协议契约。
- 参见 [ARCHITECTURE.md](ARCHITECTURE.md) 了解系统架构图和天气主题渐变系统的详细细节。
