import { createPinia } from "pinia";

// 创建 Pinia 实例
const pinia = createPinia();

// 安装函数
export function setupStore(app) {
  app.use(pinia);
}

// 导出 store 模块
export * from "./modules/memory";

export default pinia;
