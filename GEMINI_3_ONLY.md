# Gemini 3 系列模型专用配置

## 🎯 配置要求

**强制规则：** 仅允许使用 Gemini 3 系列模型

---

## ✅ 允许使用的模型

### 1️⃣ **gemini-3-flash-preview** ⚡ (默认)

**性能等级：** ⭐⭐⭐⭐
**优势：**
- 响应速度快
- 服务器负载较低（相比 Pro）
- 稳定性好
- 成本较低
- 适合大多数前端开发任务

**使用场景：**
- React 组件开发
- UI/UX 设计
- CSS/Tailwind 样式
- 日常前端任务
- 快速原型开发

**命令：**
```bash
gemini -m gemini-3-flash-preview -y -p "任务描述"
```

---

### 2️⃣ **gemini-3-pro-preview** 🔥 (备用)

**性能等级：** ⭐⭐⭐⭐⭐
**优势：**
- 最强智能
- 复杂问题解决能力强
- 代码质量更高
- 架构设计能力强

**使用场景：**
- 复杂的架构设计
- 高级 TypeScript 类型定义
- 性能优化
- 代码重构
- 需要深度思考的任务

**注意：**
- ⚠️ 服务器容量有限，可能遇到 429 错误
- ⚠️ 仅在 Flash 无法胜任时使用

**命令：**
```bash
gemini -m gemini-3-pro-preview -y -p "任务描述"
```

---

## ❌ 禁止使用的模型

### Gemini 2.5 系列（全部禁用）

- ❌ `gemini-2.5-pro` - 已过时
- ❌ `gemini-2.5-flash` - 已过时
- ❌ `gemini-2.5-flash-lite` - 已过时

**原因：**
- Gemini 3 系列性能更强
- 保持技术栈一致性
- 避免模型能力差异

---

## 🔄 模型选择策略

### **默认策略（推荐）**

1. **首选：** `gemini-3-flash-preview`
   - 快速、稳定、高效
   - 适合 90% 的任务

2. **备用：** `gemini-3-pro-preview`
   - 仅在 Flash 无法胜任时使用
   - 复杂架构设计
   - 高级优化任务

### **决策流程图**

```
任务难度评估
    │
    ├─ 简单/中等 → gemini-3-flash-preview ⚡
    │
    └─ 复杂/高级 → 先尝试 gemini-3-flash-preview
                    │
                    ├─ 成功 → 完成 ✅
                    │
                    └─ 失败 → gemini-3-pro-preview 🔥
```

---

## 📋 使用示例

### **示例 1：React 组件开发（Flash）**

```bash
gemini -m gemini-3-flash-preview -y -p "创建一个响应式的导航栏组件，使用 Tailwind CSS，支持移动端菜单"
```

**为什么用 Flash：**
- 标准的组件开发任务
- Flash 完全胜任
- 响应速度快

---

### **示例 2：复杂状态管理（优先 Flash）**

```bash
# 先尝试 Flash
gemini -m gemini-3-flash-preview -y -p "设计一个复杂的表单状态管理方案，包含验证、多步骤、条件字段"

# 如果 Flash 结果不理想，再用 Pro
gemini -m gemini-3-pro-preview -y -p "设计一个复杂的表单状态管理方案，包含验证、多步骤、条件字段"
```

---

### **示例 3：性能优化（Pro）**

```bash
gemini -m gemini-3-pro-preview -y -p "分析并优化这个 React 应用的性能，找出渲染瓶颈并提供优化方案"
```

**为什么用 Pro：**
- 需要深度分析
- 性能优化是高级任务
- Pro 的架构理解能力更强

---

## ⚙️ 配置文件

### **主配置**
**路径：** `C:\Users\y2003\.claude\multi-ai-config.json`

```json
{
  "workers": {
    "gemini": {
      "defaultModel": "gemini-3-flash-preview",
      "allowedModels": [
        "gemini-3-flash-preview",
        "gemini-3-pro-preview"
      ],
      "restrictToGemini3Only": true,
      "fallbackModel": "gemini-3-flash-preview"
    }
  }
}
```

### **项目配置**
**路径：** `E:\Project Exercise\todo-app-multiai\.aiconfig`

```
允许的模型（仅 Gemini 3 系列）:
- gemini-3-flash-preview ⚡ (默认)
- gemini-3-pro-preview 🔥 (备用)

禁止使用: 所有 Gemini 2.x 模型
```

---

## 🚀 快速命令参考

### **标准前端任务（Flash）**
```bash
# UI 组件
gemini -m gemini-3-flash-preview -y -p "创建 [组件名]"

# 样式调整
gemini -m gemini-3-flash-preview -y -p "优化 [组件] 的 Tailwind 样式"

# 功能实现
gemini -m gemini-3-flash-preview -y -p "实现 [功能描述]"
```

### **高级任务（Pro）**
```bash
# 架构设计
gemini -m gemini-3-pro-preview -y -p "设计 [系统架构]"

# 性能优化
gemini -m gemini-3-pro-preview -y -p "优化 [性能问题]"

# 重构
gemini -m gemini-3-pro-preview -y -p "重构 [代码模块]"
```

---

## 📊 两个模型对比

| 特性 | gemini-3-flash-preview | gemini-3-pro-preview |
|------|------------------------|----------------------|
| **速度** | ⚡⚡⚡⚡⚡ 极快 | ⚡⚡⚡ 中等 |
| **智能** | ⭐⭐⭐⭐ 优秀 | ⭐⭐⭐⭐⭐ 顶级 |
| **稳定性** | ⭐⭐⭐⭐⭐ 很稳定 | ⭐⭐⭐ 容量有限 |
| **成本** | 💰 较低 | 💰💰 较高 |
| **适用场景** | 90% 日常任务 | 10% 复杂任务 |
| **推荐度** | ⭐⭐⭐⭐⭐ 默认首选 | ⭐⭐⭐⭐ 高级备用 |

---

## ⚠️ 常见问题

### Q1: 为什么不允许使用 Gemini 2.5？

**A:**
- Gemini 3 系列性能更强
- 保持技术栈一致性
- 简化模型选择决策

### Q2: Flash 和 Pro 差距大吗？

**A:**
- 日常任务：差距不大，Flash 完全够用
- 复杂任务：Pro 更强，但 Flash 也能完成大部分
- 建议：优先用 Flash，不满意再用 Pro

### Q3: 遇到 429 错误怎么办？

**A:**
1. 如果是 Pro → 切换到 Flash
2. 如果是 Flash → 等待 5-10 分钟重试
3. 检查是否可以简化任务描述

### Q4: 什么时候必须用 Pro？

**A:**
- 复杂的架构设计
- 深度性能优化
- 高级算法实现
- Flash 多次尝试失败后

---

## 🎯 最佳实践

### ✅ DO（推荐做法）

1. **默认使用 Flash**
   ```bash
   gemini -m gemini-3-flash-preview -y -p "任务"
   ```

2. **明确任务描述**
   - 详细说明需求
   - 提供上下文
   - 指定技术栈

3. **渐进式升级**
   ```
   Flash 尝试 → 评估结果 → 不满意再用 Pro
   ```

### ❌ DON'T（避免做法）

1. **不要盲目使用 Pro**
   - ❌ 简单任务用 Pro（浪费资源）
   - ✅ 先用 Flash 评估

2. **不要使用 Gemini 2.x**
   - ❌ gemini-2.5-pro
   - ✅ gemini-3-flash-preview

3. **不要忽略错误信息**
   - 429 错误 → 换模型或等待
   - 404 错误 → 检查模型名称

---

## 📝 记录使用情况

建议记录每次模型使用：

```
任务: 创建 Todo 组件
模型: gemini-3-flash-preview ⚡
结果: 成功 ✅
耗时: 15 秒
质量: ⭐⭐⭐⭐⭐

---

任务: 优化渲染性能
模型: gemini-3-flash-preview ⚡
结果: 部分成功 ⚠️
升级: gemini-3-pro-preview 🔥
最终结果: 成功 ✅
```

---

**配置更新日期：** 2026-02-09
**默认模型：** gemini-3-flash-preview ⚡
**允许模型：** 仅 Gemini 3 系列
**维护者：** Claude (Product Manager)
