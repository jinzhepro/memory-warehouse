# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## 项目编码规则 (非显而易见部分)

### 状态管理特定规则

- 必须使用 `src/utils/storage.js` 中的 Promise 封装函数进行本地存储操作
- 所有记忆数据操作必须通过 `src/store/modules/memory.js` 中的 Pinia store 进行
- 记忆条目的 ID 必须使用 store 中定义的 `generateUUID()` 函数生成
- 时间戳必须使用 `new Date().toISOString()` 格式存储

### 组件结构约定

- 页面组件必须使用自定义导航栏 (`navigationStyle: "custom"`)
- 状态栏高度必须通过 CSS 变量 `--status-bar-height` 适配
- 底部操作栏必须添加安全区域适配 `padding-bottom: calc(24rpx + 68rpx)`
- 页面间参数传递必须使用 `getCurrentPages()` 获取当前页面参数

### 样式系统规则

- 必须使用 SCSS 预处理器，全局变量从 `src/styles/variables.scss` 导入
- 主色调必须使用 `$primary-color: #5b8dee` 变量
- 响应式单位必须使用 rpx 而非 px
- 组件样式必须使用 `scoped` 属性避免样式污染

### uni-app 特定约定

- 必须使用 uni-app API 而非浏览器 API (如 `uni.navigateTo` 而非 `window.location`)
- 平台差异必须使用条件编译处理 (`#ifdef MP-WEIXIN`)
- 页面路由必须在 `src/pages.json` 中预先定义
- 组件导入必须使用 `@/` 别名指向 src 目录

### 数据验证规则

- 标题必须限制在 50 字符内
- 内容必须限制在 10000 字符内
- 标签最多 10 个，每个标签最多 20 字符
- 表单验证必须在组件内部实现，错误信息显示在对应输入框下方

### 错误处理约定

- 存储操作必须使用 try-catch 包装
- 用户操作必须使用 `uni.showToast` 显示反馈
- 删除操作必须使用 `uni.showModal` 进行二次确认
- 页面加载失败必须显示友好的错误状态
