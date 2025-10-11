# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## 项目概述

这是一个基于 uni-app 和 Vue 3 的微信小程序项目，名为"记忆仓库"，用于本地存储和管理记忆条目。

## 构建和开发命令

```bash
# 开发模式 - 微信小程序
npm run dev:mp-weixin

# 构建生产版本 - 微信小程序
npm run build:mp-weixin

# 开发模式 - H5
npm run dev:h5

# 构建生产版本 - H5
npm run build:h5
```

## 项目特定架构

### 状态管理

- 使用 Pinia 进行状态管理，配置在 `src/store/index.js`
- 核心状态模块在 `src/store/modules/memory.js`，管理记忆条目和标签
- 所有数据存储在本地，使用 `src/utils/storage.js` 封装的 uni-app 存储 API

### 页面结构

- `src/pages/index/` - 首页，显示记忆列表和搜索功能
- `src/pages/detail/` - 详情页，查看单个记忆
- `src/pages/edit/` - 编辑页，创建或编辑记忆
- `src/pages/search/` - 搜索页，高级搜索功能

### 存储键名

- `memory_warehouse_memories` - 存储所有记忆条目
- `memory_warehouse_tags` - 存储所有标签
- `memory_warehouse_settings` - 存储应用设置

## 代码风格指南

### 样式系统

- 使用 SCSS 预处理器
- 全局变量定义在 `src/styles/variables.scss`
- 工具类定义在 `src/styles/utilities.scss`
- 主色调：`#5b8dee` (蓝色)
- 使用 rpx 单位进行响应式设计

### 组件结构

- Vue 3 Composition API
- 使用 `<script>` 标签而非 `<script setup>`
- 样式使用 `scoped` 属性
- 页面组件使用自定义导航栏 (`navigationStyle: "custom"`)

### 数据结构

- 记忆条目包含：id, title, content, tags, createTime, updateTime
- 使用 UUID 作为记忆条目的唯一标识
- 时间使用 ISO 字符串格式存储

### 特殊约定

- 状态栏高度通过 CSS 变量 `--status-bar-height` 适配
- 底部操作栏需要添加安全区域适配 `padding-bottom: calc(24rpx + 68rpx)`
- 使用 uni-app 的条件编译处理平台差异，如 `#ifdef MP-WEIXIN`

## 注意事项

- 所有数据存储在本地，清除小程序数据会导致记忆丢失
- 标题限制 50 字符，内容限制 10000 字符
- 标签最多 10 个，每个标签最多 20 字符
- 使用 uni-app 的 API 而非浏览器 API，如 `uni.navigateTo` 而非 `window.location`
- 页面间通过 URL 参数传递数据，使用 `getCurrentPages()` 获取页面参数
