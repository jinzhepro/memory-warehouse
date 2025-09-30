/**
 * 本地存储服务
 * 封装 uni-app 的本地存储 API
 */

// 存储键名
export const STORAGE_KEYS = {
  MEMORIES: "memory_warehouse_memories", // 记忆条目
  TAGS: "memory_warehouse_tags", // 标签
  SETTINGS: "memory_warehouse_settings", // 设置
};

/**
 * 保存数据到本地存储
 * @param {string} key 存储键名
 * @param {any} data 要存储的数据
 * @returns {Promise}
 */
export function setStorage(key, data) {
  return new Promise((resolve, reject) => {
    uni.setStorage({
      key,
      data,
      success: () => resolve(),
      fail: (err) => reject(err),
    });
  });
}

/**
 * 从本地存储获取数据
 * @param {string} key 存储键名
 * @returns {Promise}
 */
export function getStorage(key) {
  return new Promise((resolve, reject) => {
    uni.getStorage({
      key,
      success: (res) => resolve(res.data),
      fail: () => resolve(null), // 如果获取失败，返回null
    });
  });
}

/**
 * 删除本地存储数据
 * @param {string} key 存储键名
 * @returns {Promise}
 */
export function removeStorage(key) {
  return new Promise((resolve, reject) => {
    uni.removeStorage({
      key,
      success: () => resolve(),
      fail: (err) => reject(err),
    });
  });
}

/**
 * 清空本地存储
 * @returns {Promise}
 */
export function clearStorage() {
  return new Promise((resolve, reject) => {
    uni.clearStorage({
      success: () => resolve(),
      fail: (err) => reject(err),
    });
  });
}

/**
 * 获取所有存储信息
 * @returns {Promise}
 */
export function getStorageInfo() {
  return new Promise((resolve, reject) => {
    uni.getStorageInfo({
      success: (res) => resolve(res),
      fail: (err) => reject(err),
    });
  });
}

export default {
  STORAGE_KEYS,
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  getStorageInfo,
};
