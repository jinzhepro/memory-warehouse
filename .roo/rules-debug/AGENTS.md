# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## 项目调试规则 (非显而易见部分)

### 本地存储调试

- 使用 `uni.getStorageInfo()` 查看存储使用情况
- 存储键名前缀为 `memory_warehouse_`，检查时注意过滤
- 清除存储数据使用 `uni.clearStorage()`，会删除所有用户数据

### 状态管理调试

- Pinia store 状态可在浏览器开发者工具的 Vue 插件中查看
- 记忆数据变化会自动触发本地存储，注意异步操作
- store 初始化在页面 `onMounted` 生命周期中调用

### 页面参数调试

- 页面间参数通过 URL 传递，使用 `getCurrentPages()` 获取当前页面实例
- 参数在 `currentPage.options` 中，注意参数类型转换
- 编辑页面的 ID 参数可能为空，需要做空值检查

### 平台特定调试

- 微信小程序调试需要使用微信开发者工具
- 条件编译代码在不同平台表现不同，注意 `#ifdef` 和 `#ifndef` 区块
- H5 调试可在浏览器中进行，但某些 uni-app API 不可用

### 常见问题排查

- 状态栏高度适配问题：检查 `--status-bar-height` CSS 变量是否正确设置
- 底部安全区域问题：确认 `padding-bottom: calc(24rpx + 68rpx)` 是否应用
- 页面跳转失败：检查 `src/pages.json` 中是否已定义目标页面路由
- 数据不持久化：确认是否使用了 `src/utils/storage.js` 中的 Promise 封装函数

### 性能监控

- 记忆列表渲染性能：注意 `v-for` 的 key 使用记忆 ID
- 搜索功能性能：大量数据时考虑防抖处理
- 存储操作性能：频繁写入可能影响用户体验，考虑批量操作
