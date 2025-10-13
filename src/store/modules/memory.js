/**
 * 记忆管理状态模块
 * 使用 Pinia 管理记忆条目和标签数据
 */
import { defineStore } from "pinia";
import { STORAGE_KEYS, getStorage, setStorage } from "@/utils/storage";
import { ref, computed } from "vue";

// 生成UUID
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const useMemoryStore = defineStore("memory", () => {
  // 状态
  const memories = ref([]); // 记忆条目列表
  const tags = ref([]); // 标签列表
  const isLoading = ref(false); // 加载状态

  // 计算属性
  const memoryCount = computed(() => memories.value.length);

  const sortedMemories = computed(() => {
    return [...memories.value].sort((a, b) => {
      // 首先按置顶状态排序
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // 置顶状态相同时，按更新时间排序
      return new Date(b.updateTime) - new Date(a.updateTime);
    });
  });

  const getMemoriesByTag = (tag) => {
    return memories.value.filter(
      (memory) => memory.tags && memory.tags.includes(tag)
    );
  };

  // 获取所有标签
  const allTags = computed(() => {
    const tagSet = new Set();
    memories.value.forEach((memory) => {
      if (memory.tags && Array.isArray(memory.tags)) {
        memory.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet);
  });

  // 搜索记忆
  const searchMemories = (keyword) => {
    if (!keyword) return sortedMemories.value;

    const lowerKeyword = keyword.toLowerCase();
    return sortedMemories.value.filter(
      (memory) =>
        memory.title.toLowerCase().includes(lowerKeyword) ||
        memory.content.toLowerCase().includes(lowerKeyword) ||
        (memory.tags &&
          memory.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword)))
    );
  };

  // 动作
  // 初始化数据
  async function initialize() {
    isLoading.value = true;
    try {
      const [savedMemories, savedTags] = await Promise.all([
        getStorage(STORAGE_KEYS.MEMORIES),
        getStorage(STORAGE_KEYS.TAGS),
      ]);

      // 处理旧数据兼容性
      const processedMemories = (savedMemories || []).map((memory) => ({
        ...memory,
        isPinned: memory.isPinned || false, // 确保所有记忆都有isPinned字段
      }));

      memories.value = processedMemories;
      tags.value = savedTags || [];
    } catch (error) {
      console.error("初始化数据失败:", error);
      memories.value = [];
      tags.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  // 保存数据到本地存储
  async function saveToStorage() {
    try {
      await Promise.all([
        setStorage(STORAGE_KEYS.MEMORIES, memories.value),
        setStorage(STORAGE_KEYS.TAGS, tags.value),
      ]);
    } catch (error) {
      console.error("保存数据失败:", error);
    }
  }

  // 添加记忆
  async function addMemory(memoryData) {
    const newMemory = {
      id: generateUUID(),
      title: memoryData.title || "未命名记忆",
      content: memoryData.content || "",
      tags: memoryData.tags || [],
      isPinned: memoryData.isPinned || false, // 新增置顶字段
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };

    memories.value.unshift(newMemory);
    await saveToStorage();
    return newMemory;
  }

  // 更新记忆
  async function updateMemory(id, updateData) {
    const index = memories.value.findIndex((memory) => memory.id === id);
    if (index !== -1) {
      memories.value[index] = {
        ...memories.value[index],
        ...updateData,
        updateTime: new Date().toISOString(),
      };
      await saveToStorage();
      return memories.value[index];
    }
    return null;
  }

  // 删除记忆
  async function deleteMemory(id) {
    const index = memories.value.findIndex((memory) => memory.id === id);
    if (index !== -1) {
      memories.value.splice(index, 1);
      await saveToStorage();
      return true;
    }
    return false;
  }

  // 获取记忆详情
  const getMemoryById = (id) => {
    return memories.value.find((memory) => memory.id === id);
  };

  // 添加标签
  async function addTag(tag) {
    if (tag && !tags.value.includes(tag)) {
      tags.value.push(tag);
      await saveToStorage();
    }
  }

  // 删除标签
  async function removeTag(tag) {
    const index = tags.value.indexOf(tag);
    if (index !== -1) {
      tags.value.splice(index, 1);
      // 同时移除所有记忆中的该标签
      memories.value.forEach((memory) => {
        if (memory.tags && memory.tags.includes(tag)) {
          memory.tags = memory.tags.filter((t) => t !== tag);
        }
      });
      await saveToStorage();
    }
  }

  // 切换记忆置顶状态
  async function togglePin(id) {
    const memory = memories.value.find((m) => m.id === id);
    if (memory) {
      memory.isPinned = !memory.isPinned;
      memory.updateTime = new Date().toISOString();
      await saveToStorage();
      return memory;
    }
    return null;
  }

  // 置顶记忆
  async function pinMemory(id) {
    const memory = memories.value.find((m) => m.id === id);
    if (memory && !memory.isPinned) {
      memory.isPinned = true;
      memory.updateTime = new Date().toISOString();
      await saveToStorage();
      return memory;
    }
    return null;
  }

  // 取消置顶记忆
  async function unpinMemory(id) {
    const memory = memories.value.find((m) => m.id === id);
    if (memory && memory.isPinned) {
      memory.isPinned = false;
      memory.updateTime = new Date().toISOString();
      await saveToStorage();
      return memory;
    }
    return null;
  }

  // 获取所有置顶的记忆
  const getPinnedMemories = computed(() => {
    return memories.value.filter((memory) => memory.isPinned);
  });

  return {
    // 状态
    memories,
    tags,
    isLoading,

    // 计算属性
    memoryCount,
    sortedMemories,
    allTags,
    getPinnedMemories,

    // 动作
    initialize,
    addMemory,
    updateMemory,
    deleteMemory,
    getMemoryById,
    getMemoriesByTag,
    searchMemories,
    addTag,
    removeTag,
    togglePin,
    pinMemory,
    unpinMemory,
  };
});
