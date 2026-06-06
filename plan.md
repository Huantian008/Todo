# Todo 项目完整重构计划：Go + React + MongoDB + 高德天气

## 1. 项目目标

将当前 Todo 项目完整重构为：

- 后端：Go + Gin
- 前端：React + TypeScript + Vite + Tailwind CSS
- 数据库：MongoDB
- 天气服务：高德地图 Web 服务 API
- 产品重点：今日 Todo
- 天气用途：展示今日天气，并让页面 UI 颜色和 CSS 背景氛围随天气动态变化
- 发布目标：最终上传到 GitHub 仓库 `Huantian008/Todo`

当前项目是 Express + React Todo 应用。本次重构不是小改，而是替换后端技术栈、增加 MongoDB、重新设计前端页面，并接入高德天气。

高德天气文档：
https://lbs.amap.com/api/webservice/guide/api/weatherinfo

高德逆地理编码文档：
https://lbs.amap.com/api/webservice/guide/api/georegeo/

## 2. 重要约束

- 不要把真实高德 Key 写入 Git 仓库。
- 高德 Key 只能放在本地 `.env`。
- `.env.example` 只能写占位值，例如 `AMAP_KEY=your_amap_key_here`。
- 不要提交：
  - `.env`
  - `node_modules`
  - `dist`
  - `coverage`
  - `.superpowers/`
  - MongoDB 本地数据目录
- 前端不要直接调用高德 API，避免暴露 Key。
- 高德 API 全部由 Go 后端代理调用。
- “今日 Todo”通过 Todo 的 `taskDate` 字段判断，不按创建时间判断。

## 3. 目标目录结构

建议重构后结构如下：

```txt
todo-app-multiai/
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── config/
│   │   ├── db/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── handlers/
│   │   └── routes/
│   ├── go.mod
│   ├── go.sum
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── style.css
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── .gitignore
├── README.md
└── plan.md
```

## 4. 后端实施计划

### 4.1 技术栈

使用：

- Go
- Gin
- MongoDB Go Driver
- godotenv
- net/http 调用高德 API
- testing + httptest 做测试

推荐依赖：

```bash
go get github.com/gin-gonic/gin
go get go.mongodb.org/mongo-driver/mongo
go get github.com/joho/godotenv
```

### 4.2 环境变量

`backend/.env.example`：

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=todo_app
AMAP_KEY=your_amap_key_here
CORS_ORIGIN=http://localhost:5173
```

本地实际 `.env` 放真实高德 Key，但不能提交。

### 4.3 MongoDB

在项目根目录增加 `docker-compose.yml`：

```yaml
services:
  mongodb:
    image: mongo:7
    container_name: todo-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### 4.4 Todo 数据模型

Go 模型：

```go
type Todo struct {
    ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Title       string             `bson:"title" json:"title"`
    Description string             `bson:"description,omitempty" json:"description,omitempty"`
    Completed   bool               `bson:"completed" json:"completed"`
    TaskDate    string             `bson:"taskDate" json:"taskDate"`
    CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
    UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}
```

`taskDate` 格式固定为 `YYYY-MM-DD`。

### 4.5 API Envelope

所有 API 使用统一响应：

```json
{
  "success": true,
  "data": {},
  "count": 1
}
```

错误响应：

```json
{
  "success": false,
  "error": "Error message",
  "data": null
}
```

### 4.6 Todo API

实现以下接口：

```txt
GET    /health
GET    /api/todos?date=YYYY-MM-DD
GET    /api/todos/:id
POST   /api/todos
PUT    /api/todos/:id
DELETE /api/todos/:id
```

`GET /api/todos`：

- 如果有 `date` 参数，只返回该日期 Todo。
- 默认按 `completed=false` 在前，再按 `createdAt` 升序。

`POST /api/todos` 请求：

```json
{
  "title": "写 Go 后端",
  "description": "完成 Gin + MongoDB API",
  "taskDate": "2026-06-06"
}
```

校验规则：

- `title` 必填，trim 后不能为空。
- `taskDate` 必填，格式必须是 `YYYY-MM-DD`。
- `completed` 创建时默认 false。

`PUT /api/todos/:id` 支持部分更新：

```json
{
  "title": "新标题",
  "description": "新描述",
  "completed": true,
  "taskDate": "2026-06-06"
}
```

### 4.7 天气 API

新增：

```txt
GET /api/weather/today?lat=<latitude>&lng=<longitude>
```

前端传浏览器定位得到的纬度和经度。

注意：

- 前端参数叫 `lat` 和 `lng`。
- 调高德逆地理编码时，`location` 必须是 `lng,lat`，经度在前，纬度在后。

处理流程：

1. 校验 `lat` 和 `lng`。
2. 调用高德逆地理编码接口：

```txt
https://restapi.amap.com/v3/geocode/regeo?key=<AMAP_KEY>&location=<lng>,<lat>&extensions=base&output=json
```

3. 从返回结果中取 `regeocode.addressComponent.adcode`。
4. 调用高德天气接口：

```txt
https://restapi.amap.com/v3/weather/weatherInfo?key=<AMAP_KEY>&city=<adcode>&extensions=base&output=json
```

5. 从 `lives[0]` 返回今日实况天气。
6. 后端把高德返回值标准化后返回给前端。

返回格式：

```json
{
  "success": true,
  "data": {
    "province": "浙江省",
    "city": "杭州市",
    "adcode": "330100",
    "weather": "多云",
    "condition": "cloudy",
    "temperature": "26",
    "humidity": "68",
    "windDirection": "东南",
    "windPower": "≤3",
    "reportTime": "2026-06-06 14:00:00"
  }
}
```

`condition` 标准化规则：

- 包含 `晴`：`sunny`
- 包含 `云` 或 `阴`：`cloudy`
- 包含 `雨`：`rainy`
- 包含 `雪`：`snowy`
- 包含 `雾`、`霾`、`沙`、`尘`：`foggy`
- 其他：`default`

## 5. 前端实施计划

### 5.1 技术栈

保留：

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Axios

可增加但非必须：

- `lucide-react` 用于天气和 Todo 图标
- 不使用在线图片 API

### 5.2 页面定位

页面主角是“今日 Todo”。

天气只作为今日环境信息，不要做成天气 App。

推荐布局：

- 桌面端：
  - 左侧大区域：今日 Todo
  - 右侧小区域：今日天气卡片 + 今日统计
- 移动端：
  - 顶部：今日标题
  - 其次：天气胶囊卡片
  - 主体：Todo 列表

### 5.3 前端组件建议

```txt
src/components/
├── TodayHeader.tsx
├── WeatherCard.tsx
├── AddTodo.tsx
├── TodoList.tsx
├── TodoItem.tsx
├── TodoFilters.tsx
└── EmptyState.tsx
```

```txt
src/hooks/
├── useTodayTodos.ts
├── useWeather.ts
└── useGeolocation.ts
```

```txt
src/api/
├── todos.ts
└── weather.ts
```

```txt
src/types/
├── todo.ts
└── weather.ts
```

### 5.4 Todo 类型

```ts
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  taskDate: string;
  createdAt: string;
  updatedAt: string;
}
```

### 5.5 Weather 类型

```ts
export type WeatherCondition =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'snowy'
  | 'foggy'
  | 'default';

export interface TodayWeather {
  province: string;
  city: string;
  adcode: string;
  weather: string;
  condition: WeatherCondition;
  temperature: string;
  humidity: string;
  windDirection: string;
  windPower: string;
  reportTime: string;
}
```

### 5.6 动态天气 UI

前端根据 `weather.condition` 给根容器设置 class：

```tsx
<div className={`app-shell weather-${weather?.condition ?? 'default'}`}>
```

在 CSS 中定义主题变量：

```css
.weather-sunny {
  --bg-start: #fff7d6;
  --bg-end: #dff6ff;
  --accent: #f59e0b;
  --surface: rgba(255, 255, 255, 0.78);
}

.weather-cloudy {
  --bg-start: #e5e7eb;
  --bg-end: #f8fafc;
  --accent: #64748b;
  --surface: rgba(255, 255, 255, 0.82);
}

.weather-rainy {
  --bg-start: #dbeafe;
  --bg-end: #1e3a8a;
  --accent: #38bdf8;
  --surface: rgba(255, 255, 255, 0.76);
}

.weather-snowy {
  --bg-start: #f8fafc;
  --bg-end: #dbeafe;
  --accent: #60a5fa;
  --surface: rgba(255, 255, 255, 0.86);
}

.weather-foggy {
  --bg-start: #e5e7eb;
  --bg-end: #cbd5e1;
  --accent: #71717a;
  --surface: rgba(255, 255, 255, 0.72);
}

.weather-default {
  --bg-start: #f8fafc;
  --bg-end: #e0f2fe;
  --accent: #0ea5e9;
  --surface: rgba(255, 255, 255, 0.8);
}
```

页面背景使用 CSS，不用在线图片：

```css
.app-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 10%, color-mix(in srgb, var(--accent) 28%, transparent), transparent 30%),
    linear-gradient(135deg, var(--bg-start), var(--bg-end));
  transition: background 500ms ease, color 300ms ease;
}
```

可以增加天气特定轻量效果：

- sunny：柔和光斑
- cloudy：慢速云层渐变
- rainy：细线雨滴 overlay
- snowy：小点雪花 overlay
- foggy：半透明雾层
- default：普通渐变

不要让动画影响 Todo 可读性。

### 5.7 前端行为

启动页面时：

1. 获取今天日期 `YYYY-MM-DD`。
2. 请求 `GET /api/todos?date=today`。
3. 请求浏览器定位。
4. 定位成功后请求 `/api/weather/today?lat=...&lng=...`。
5. 根据天气结果设置动态主题。

定位失败时：

- Todo 功能必须正常。
- WeatherCard 显示“无法获取定位，暂不显示天气”。
- 页面使用 `weather-default` 主题。

天气 API 失败时：

- Todo 功能必须正常。
- WeatherCard 显示“天气获取失败”。
- 页面使用 `weather-default` 主题。

### 5.8 Todo 功能

必须保留：

- 添加今日 Todo
- 标记完成/未完成
- 编辑标题
- 删除
- 筛选：
  - All
  - Active
  - Completed

新增 Todo 默认 `taskDate` 为今天。

## 6. 清理旧实现

### 6.1 后端

删除或替换旧 Node 后端：

- `backend/package.json`
- `backend/package-lock.json`
- `backend/src/**/*.js`
- `backend/tests/**/*.js`

改为 Go 项目。

### 6.2 文档

更新：

- `README.md`
- `CLAUDE.md`
- `ARCHITECTURE.md`

说明新技术栈：

- Go Gin
- MongoDB
- React + TypeScript + Vite
- 高德天气
- Docker Compose

### 6.3 Git Ignore

根目录 `.gitignore` 至少包含：

```gitignore
.env
*.env
node_modules/
dist/
coverage/
.superpowers/
backend/.env
frontend/.env
.DS_Store
*.log
```

保留前后端各自需要的 `.gitignore` 也可以。

## 7. 测试计划

### 7.1 后端测试

运行：

```bash
cd backend
go test ./...
```

覆盖场景：

- 创建 Todo 成功
- title 为空返回 400
- taskDate 格式错误返回 400
- 按日期查询 Todo
- 更新 Todo
- 删除 Todo
- 查询不存在 Todo 返回 404
- 天气接口缺少 lat/lng 返回 400
- 高德接口失败时返回合理错误
- MongoDB 连接失败时服务启动或请求错误可读

### 7.2 前端测试

运行：

```bash
cd frontend
npm run typecheck
npm run build
```

手动验证：

- 页面加载今日 Todo
- 添加 Todo 后立即出现在今日列表
- 完成 Todo 后排序或样式正确
- 编辑 Todo 正常
- 删除 Todo 正常
- 定位成功后显示天气
- 定位失败后 Todo 不受影响
- 不同 `condition` 下 UI 颜色和 CSS 背景变化

### 7.3 集成测试

运行：

```bash
docker compose up -d mongodb
cd backend
go run ./cmd/server
cd frontend
npm run dev
```

访问：

```txt
http://localhost:5173
```

确认：

- 前端能连上 Go 后端
- Go 后端能连上 MongoDB
- Todo 数据刷新后仍保留
- 天气通过后端代理高德 API 获取

## 8. GitHub 发布计划

目标仓库：

```txt
https://github.com/Huantian008/Todo
```

当前远程仓库已有初始 `LICENSE`，本地发布前不要强推覆盖。

推荐流程：

```bash
git remote add origin https://github.com/Huantian008/Todo.git
git fetch origin
git branch -M main
git pull origin main --allow-unrelated-histories
```

如出现 LICENSE 冲突，保留远程 MIT LICENSE 或合并内容。

完成重构和测试后：

```bash
git status
git add .
git commit -m "feat: rebuild todo app with go mongodb and weather ui"
git push -u origin main
```

发布前确认：

- 没有 `.env`
- 没有真实高德 Key
- 没有 `.superpowers/`
- 没有 `node_modules`
- 没有构建产物
- `README.md` 已更新运行说明

## 9. 推荐执行顺序

1. 更新 `.gitignore`，防止误提交密钥和临时文件。
2. 搭建 Go 后端项目结构。
3. 接入 MongoDB 和 Todo CRUD。
4. 加入 Docker Compose。
5. 实现高德逆地理编码 + 天气代理 API。
6. 重构 React 类型、API client 和 hooks。
7. 重做今日 Todo 页面。
8. 加入天气驱动 CSS 动态主题。
9. 更新 README 和架构文档。
10. 运行后端测试。
11. 运行前端 typecheck/build。
12. 本地完整联调。
13. 推送到 GitHub。

## 10. 完成标准

项目完成后应满足：

- `docker compose up -d mongodb` 可启动数据库。
- `go run ./cmd/server` 可启动 Go 后端。
- `npm run dev` 可启动前端。
- 浏览器打开前端后，默认显示今日 Todo。
- Todo CRUD 全部可用。
- 浏览器定位成功时显示今日天气。
- 天气不同，页面 CSS 背景和 UI 颜色随之变化。
- 定位或天气失败不会影响 Todo。
- MongoDB 中能持久化 Todo。
- GitHub 仓库包含完整源码和运行文档。
- 仓库不包含真实高德 Key。
