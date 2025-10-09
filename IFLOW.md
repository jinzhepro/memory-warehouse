# 记忆仓库 - 微信小程序项目指南

## 项目概述

记忆仓库是一个基于 **uni-app (Vue 3)** 和 **Pinia** 的本地存储记忆管理微信小程序。所有数据都存储在用户设备本地，无需后端服务器，保护用户隐私。用户可以创建、编辑、删除和搜索记忆条目，并通过标签进行分类管理。

## 技术栈

- **框架**: uni-app (Vue 3)
- **状态管理**: Pinia
- **本地存储**: uni.setStorage/uni.getStorage (封装在 `src/utils/storage.js`)
- **UI**: 原生小程序组件 + 自定义 SCSS 样式
- **构建工具**: Vite
- **包管理**: npm

## 项目结构

```
src/
├── pages/           # 页面目录
│   ├── index/       # 首页 - 记忆列表
│   ├── detail/      # 详情页 - 查看记忆
│   ├── edit/        # 编辑页 - 添加/编辑记忆
│   └── search/      # 搜索页 - 搜索功能
├── components/      # 公共组件 (如 Icon)
├── utils/          # 工具函数
│   └── storage.js   # 本地存储 API 封装
├── store/          # Pinia 状态管理
│   ├── index.js     # Pinia 配置入口
│   └── modules/
│       └── memory.js # 记忆管理核心逻辑
├── static/         # 静态资源 (logo.png)
├── styles/         # 全局样式
│   ├── utilities.scss
│   └── variables.scss
├── App.vue         # 应用根组件
├── main.js         # 应用主入口
├── manifest.json   # 小程序应用配置
└── pages.json      # 页面路由和样式配置
```

## 数据存储

### 存储结构

- **记忆条目**:
  ```javascript
  {
    "id": "uuid",
    "title": "记忆标题",
    "content": "记忆内容",
    "tags": ["标签1", "标签2"],
    "createTime": "ISO时间字符串",
    "updateTime": "ISO时间字符串"
  }
  ```

- **标签列表**: `["标签1", "标签2", "标签3"]`

### 存储键名

在 `src/utils/storage.js` 中定义:
- `memory_warehouse_memories`: 存储所有记忆条目
- `memory_warehouse_tags`: 存储所有标签

## 开发与构建

### 环境准备

1. 安装 Node.js (项目使用 Volta 锁定为 v22.20.0)
2. 安装微信开发者工具
3. 全局安装 uni-app CLI: `npm install -g @dcloudio/uni-cli`

### 常用命令

从 `package.json` 中提取:

#### 安装依赖
```bash
npm install
```

#### 开发调试
```bash
# 启动微信小程序开发模式
npm run dev:mp-weixin
```

#### 构建发布
```bash
# 构建微信小程序生产版本
npm run build:mp-weixin
```

> **注意**: 项目支持多端编译，可通过 `npm run dev:mp-*` 和 `npm run build:mp-*` 命令编译到其他小程序平台。

## 核心功能

### 记忆管理
- **创建**: 在编辑页添加新记忆，自动生成 UUID 和时间戳
- **查看**: 在详情页查看记忆完整内容
- **编辑**: 修改记忆标题、内容和标签
- **删除**: 从列表中移除记忆

### 标签系统
- 为记忆添加多个标签
- 标签自动聚合去重
- 支持按标签筛选记忆

### 搜索功能
- 支持全文搜索（标题、内容、标签）
- 搜索结果按更新时间倒序排列

### 状态管理
- 使用 Pinia (`src/store/modules/memory.js`) 集中管理所有记忆和标签数据
- 提供 `initialize()`, `addMemory()`, `updateMemory()`, `deleteMemory()` 等核心方法
- 自动同步到本地存储

## UI/UX 特点

- **导航栏**: 首页使用系统导航栏，其他页面使用自定义导航栏 (`navigationStyle: "custom"`)
- **状态栏适配**: `App.vue` 中动态获取状态栏高度并设置 CSS 变量 `--status-bar-height`
- **全局样式**: 定义了基础页面背景、按钮、输入框等全局样式
- **响应式设计**: 使用 rpx 单位适配不同屏幕尺寸

## 配置文件

- **`manifest.json`**: 小程序基础配置，包括 appid (`wx3181b9f1b8155b98`)、权限声明等
- **`pages.json`**: 页面路由配置和页面样式设置
- **`vite.config.js`**: Vite 构建配置，集成 `@dcloudio/vite-plugin-uni` 插件

## 注意事项

- **数据安全**: 所有数据仅存储在本地，清除小程序缓存会导致数据丢失
- **性能**: 内存中维护所有记忆数据，适合中小型数据量（建议不超过几百条）
- **平台限制**: 遵循微信小程序的 API 和性能限制

## 未来规划

根据 README.md，项目计划增加:
- 数据导出/导入功能
- 记忆分类功能  
- 置顶重要记忆
- 夜间模式
- 数据统计图表