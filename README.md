# Today's Todo

一个带天气氛围感的全栈今日 Todo 应用。前端根据用户所在位置的实时天气调整界面色彩和背景光晕，后端使用 Go + Gin 提供 Todo 与天气代理 API，数据存储在 MongoDB。

## 项目特色

- 天气驱动 UI：浏览器授权定位后，前端会请求后端天气接口；后端通过高德地图 API 获取实时天气，页面会根据晴天、阴天、雨天、雪天、雾霾等状态切换不同的 UI 色彩和环境光晕。
- 今日任务聚焦：按当天日期管理 Todo，支持新增、完成、编辑、删除和 All / Active / Completed 筛选。
- 丝滑交互：按钮、任务卡片、完成状态切换和列表重排都带有轻量动画反馈。
- 前后端分离：React + TypeScript + Vite 前端，Go + Gin REST API 后端，MongoDB 持久化。
- 生产部署友好：提供 Dockerfile、生产 Compose 和 Ubuntu 部署脚本；前端容器只绑定 `127.0.0.1:8088`，适合挂在已有 Nginx 旧业务旁边。
- HTTPS 友好：可使用 Cloudflare 免费 Universal SSL，将自己的域名代理到服务器。

## 技术栈

- 前端：React 19、TypeScript、Vite、Tailwind CSS
- 后端：Go、Gin
- 数据库：MongoDB
- 天气服务：高德地图逆地理编码 API + 天气查询 API
- 部署：Docker Compose、Nginx、Cloudflare

## 高德地图 API

天气功能需要在环境变量中配置高德地图 Web 服务 API Key：

```env
AMAP_KEY=你的高德地图API密钥
```

申请地址：

https://lbs.amap.com/

浏览器定位流程：

1. 用户打开页面。
2. 浏览器请求定位权限。
3. 用户允许后，前端把经纬度发送到 `/api/weather/today?lat=<lat>&lng=<lng>`。
4. 后端通过高德逆地理编码获取行政区 adcode。
5. 后端再通过高德天气接口获取实时天气。
6. 前端根据天气状态更新天气卡片和页面主题色。

如果用户没有开启浏览器定位权限，页面会提示用户开启定位权限，不会使用写死的默认城市。

## 本地开发

### 1. 启动 MongoDB

```bash
docker compose up -d mongodb
```

### 2. 配置后端环境变量

```bash
cd backend
cp .env.example .env
```

编辑 `backend/.env`：

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=todo_app
AMAP_KEY=你的高德地图API密钥
CORS_ORIGIN=http://localhost:5173
```

启动后端：

```bash
go run ./cmd/server
```

后端地址：

```text
http://localhost:3001
```

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端地址：

```text
http://localhost:5173
```

## 生产部署

生产环境推荐使用你自己的子域名部署，例如：

```text
https://todo.example.com
```

### 1. 服务器环境变量

在服务器项目根目录创建 `.env`：

```bash
cp .env.production.example .env
nano .env
```

示例：

```env
AMAP_KEY=你的高德地图API密钥
CORS_ORIGIN=https://todo.example.com
VITE_API_BASE_URL=
```

`VITE_API_BASE_URL` 留空时，前端会使用相对路径 `/api/...`，适合通过 Nginx 反向代理部署。

### 2. 构建并启动容器

```bash
bash scripts/deploy-ubuntu.sh
```

或者手动执行：

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

生产 Compose 会启动：

- `mongodb`：MongoDB 数据库
- `backend`：Go API 服务
- `frontend`：Nginx 托管的前端静态文件

前端容器只暴露到服务器本机：

```text
127.0.0.1:8088
```

### 3. Nginx 反向代理

如果服务器已有 Nginx 旧业务，不要删除旧配置，只新增一个子域名配置：

```nginx
server {
    listen 80;
    server_name todo.example.com;

    auth_basic off;

    location / {
        proxy_pass http://127.0.0.1:8088;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

检查并重载：

```bash
nginx -t
systemctl reload nginx
```

### 4. Cloudflare HTTPS

DNS 添加 A 记录：

```text
todo.example.com -> YOUR_SERVER_IP
```

开启橙色云朵代理后，Cloudflare 的免费 Universal SSL 会自动签发和续期。推荐先使用：

```text
SSL/TLS encryption mode: Flexible
Always Use HTTPS: On
```

Cloudflare 的 Universal SSL 不需要单独续费；需要续费的是域名本身和服务器。

## API 文档

后端基础地址：

```text
http://localhost:3001
```

生产环境中前端通过相对路径访问：

```text
/api/...
```

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

后端测试：

```bash
cd backend
go test ./...
```

前端类型检查和构建：

```bash
cd frontend
npm run typecheck
npm run build
```

生产镜像构建：

```bash
docker compose -f docker-compose.prod.yml build
```

服务器状态检查：

```bash
docker compose -f docker-compose.prod.yml ps
curl http://127.0.0.1:8088/health
```
