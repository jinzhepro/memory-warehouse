# 记忆仓库技术上下文 (Memory Warehouse Tech Context)

## 使用的技术

### 核心框架

**uni-app (Vue 3)**

- 版本: 3.0.0-4070620250821001
- 架构: 基于 Vue 3 Composition API
- 编译: 使用 Vite 构建工具
- 多端支持: 主要针对微信小程序平台

### 状态管理

**Pinia**

- 版本: ^3.0.3
- 特性: Vue 3 官方推荐的状态管理库
- 优势: 轻量、TypeScript 支持、组合式 API

### 开发语言

**JavaScript (ES6+)**

- 模块化: ES Modules
- 异步处理: async/await, Promise
- 现代语法: 解构赋值、箭头函数、模板字符串

### UI 技术

**微信小程序原生组件**

- WXML: 微信标记语言
- WXSS: 微信样式表
- 响应式单位: rpx (responsive pixel)
- 组件库: 原生组件 + 自定义样式

### 数据存储

**微信小程序本地存储 API**

- uni.setStorage/uni.getStorage
- 异步存储操作
- 本地持久化存储
- 存储限制: 约 10MB

### 构建工具

**Vite**

- 版本: 5.2.8
- 特性: 快速冷启动、热模块替换
- 构建: Rollup 打包
- 开发服务器: 基于原生 ES 模块

## 开发环境

### 开发工具链

1. **代码编辑器**: VS Code
2. **版本控制**: Git
3. **包管理器**: npm
4. **调试工具**: 微信开发者工具
5. **构建工具**: Vite

### 开发依赖

```json
{
  "devDependencies": {
    "@dcloudio/types": "^3.4.8",
    "@dcloudio/uni-automator": "3.0.0-4070620250821001",
    "@dcloudio/uni-cli-shared": "3.0.0-4070620250821001",
    "@dcloudio/uni-stacktracey": "3.0.0-4070620250821001",
    "@dcloudio/vite-plugin-uni": "3.0.0-4070620250821001",
    "@vue/runtime-core": "^3.4.21",
    "vite": "5.2.8"
  }
}
```

### 运行时依赖

```json
{
  "dependencies": {
    "@dcloudio/uni-app": "3.0.0-4070620250821001",
    "@dcloudio/uni-mp-weixin": "3.0.0-4070620250821001",
    "@dcloudio/uni-ui": "^1.5.11",
    "pinia": "^3.0.3",
    "vue": "^3.4.21",
    "vue-i18n": "^9.1.9"
  }
}
```

## 技术约束

### 平台限制

1. **存储限制**: 微信小程序本地存储约 10MB
2. **API 限制**: 只能使用微信小程序支持的 API
3. **性能限制**: 避免复杂计算影响用户体验
4. **网络限制**: 本地存储应用，无网络请求

### 框架约束

1. **页面路由**: 必须遵循微信小程序页面导航机制
2. **组件规范**: 使用微信小程序组件规范
3. **生命周期**: 遵循 uni-app 和微信小程序生命周期
4. **数据绑定**: 使用 Vue 3 的响应式数据绑定

### 性能约束

1. **启动时间**: 应用启动时间应小于 2 秒
2. **内存占用**: 控制在合理范围内
3. **渲染性能**: 列表渲染应流畅，避免卡顿
4. **存储性能**: 存储操作应快速响应

## 依赖与工具使用模式

### 状态管理模式

```javascript
// store/index.js
import { createPinia } from "pinia";

const pinia = createPinia();

export function setupStore(app) {
  app.use(pinia);
}

export default pinia;
```

### 本地存储模式

```javascript
// utils/storage.js
export const STORAGE_KEYS = {
  MEMORIES: "memory_warehouse_memories",
  TAGS: "memory_warehouse_tags",
};

export function setStorage(key, data) {
  return new Promise((resolve, reject) => {
    uni.setStorage({ key, data, success: resolve, fail: reject });
  });
}
```

### 组件开发模式

```javascript
// pages/index/index.vue
import { ref, computed } from "vue";
import { useMemoryStore } from "@/store";

export default {
  setup() {
    const memoryStore = useMemoryStore();
    const searchKeyword = ref("");

    const filteredMemories = computed(() => {
      // 计算属性逻辑
    });

    return {
      searchKeyword,
      filteredMemories,
    };
  },
};
```

### 页面路由模式

```javascript
// 页面跳转
uni.navigateTo({
  url: `/pages/detail/detail?id=${id}`,
});

// 页面返回
uni.navigateBack();
```

### 错误处理模式

```javascript
try {
  await memoryStore.addMemory(memoryData);
  uni.showToast({ title: "添加成功", icon: "success" });
} catch (error) {
  uni.showToast({ title: "操作失败", icon: "none" });
}
```

## 代码规范

### 命名规范

1. **文件命名**: 小写驼峰命名 (camelCase)
2. **组件命名**: 大写驼峰命名 (PascalCase)
3. **变量命名**: 小写驼峰命名 (camelCase)
4. **常量命名**: 大写蛇形命名 (UPPER_SNAKE_CASE)

### 目录结构规范

```
src/
├── pages/           # 页面目录
├── components/      # 公共组件
├── utils/          # 工具函数
├── store/          # 状态管理
├── static/         # 静态资源
└── styles/         # 全局样式
```

### 代码组织规范

1. **单一职责**: 每个文件职责单一
2. **模块化**: 功能模块化组织
3. **可复用**: 工具函数和组件可复用
4. **可测试**: 代码结构便于测试

## 性能优化策略

### 代码优化

1. **懒加载**: 按需加载组件和数据
2. **缓存**: 合理使用计算属性缓存
3. **防抖**: 搜索等频繁操作使用防抖
4. **虚拟滚动**: 大列表使用虚拟滚动

### 存储优化

1. **数据结构**: 扁平化数据结构
2. **批量操作**: 减少存储 API 调用次数
3. **数据清理**: 定期清理无效数据
4. **压缩存储**: 大数据考虑压缩存储

### 渲染优化

1. **条件渲染**: 使用 v-if/v-show 控制渲染
2. **列表优化**: 使用 key 提升 diff 性能
3. **事件优化**: 合理使用事件委托
4. **样式优化**: 避免复杂样式计算

## 测试策略

### 单元测试

1. **工具函数测试**: utils 目录下的函数
2. **存储服务测试**: 本地存储封装
3. **状态管理测试**: Pinia store 模块

### 集成测试

1. **页面功能测试**: 各页面核心功能
2. **数据流测试**: 完整的数据操作流程
3. **用户场景测试**: 典型用户使用场景

### 性能测试

1. **启动性能**: 应用启动时间测试
2. **渲染性能**: 列表渲染性能测试
3. **存储性能**: 数据读写性能测试

## 部署与发布

### 开发环境

```bash
# 启动微信小程序开发模式
npm run dev:mp-weixin
```

### 生产构建

```bash
# 构建微信小程序生产版本
npm run build:mp-weixin
```

### 发布流程

1. **代码审查**: 确保代码质量
2. **功能测试**: 完整功能测试
3. **性能测试**: 性能指标检查
4. **构建发布**: 使用微信开发者工具发布

## 监控与维护

### 错误监控

1. **运行时错误**: 捕获并记录运行时错误
2. **存储错误**: 监控存储操作异常
3. **用户反馈**: 收集用户使用反馈

### 性能监控

1. **启动时间**: 监控应用启动性能
2. **操作响应**: 监控用户操作响应时间
3. **存储性能**: 监控数据读写性能

### 版本管理

1. **语义化版本**: 遵循 SemVer 规范
2. **变更日志**: 记录重要变更
3. **向后兼容**: 保持 API 向后兼容
