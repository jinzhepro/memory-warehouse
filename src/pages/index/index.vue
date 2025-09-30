<template>
  <view class="container">
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <input 
        class="search-input" 
        placeholder="搜索记忆..." 
        v-model="searchKeyword"
        @confirm="handleSearch"
      />
      <button class="search-btn" @click="handleSearch">搜索</button>
    </view>

    <!-- 标签筛选 -->
    <scroll-view class="tag-scroll" scroll-x>
      <view class="tag-list">
        <view 
          class="tag-item" 
          :class="{ active: activeTag === '' }"
          @click="filterByTag('')"
        >
          全部
        </view>
        <view 
          class="tag-item" 
          :class="{ active: activeTag === tag }"
          v-for="tag in allTags" 
          :key="tag"
          @click="filterByTag(tag)"
        >
          {{ tag }}
        </view>
      </view>
    </scroll-view>

    <!-- 记忆列表 -->
    <view class="memory-list">
      <view 
        class="memory-card" 
        v-for="memory in filteredMemories" 
        :key="memory.id"
        @click="goToDetail(memory.id)"
      >
        <view class="memory-header">
          <text class="memory-title">{{ memory.title }}</text>
          <text class="memory-time">{{ formatTime(memory.updateTime) }}</text>
        </view>
        <view class="memory-content">
          {{ memory.content.substring(0, 100) }}{{ memory.content.length > 100 ? '...' : '' }}
        </view>
        <view class="memory-tags">
          <text 
            class="tag" 
            v-for="tag in memory.tags" 
            :key="tag"
          >
            {{ tag }}
          </text>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredMemories.length === 0">
        <text class="empty-text">暂无记忆条目</text>
        <button class="add-btn" @click="goToAdd">添加第一个记忆</button>
      </view>
    </view>

    <!-- 添加按钮 -->
    <view class="add-button" @click="goToAdd">
      <text class="add-icon">+</text>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useMemoryStore } from '@/store';

export default {
  setup() {
    const memoryStore = useMemoryStore();
    const searchKeyword = ref('');
    const activeTag = ref('');

    // 初始化数据
    onMounted(async () => {
      await memoryStore.initialize();
    });

    // 计算属性
    const allTags = computed(() => memoryStore.allTags);
    
    const filteredMemories = computed(() => {
      let memories = memoryStore.sortedMemories;
      
      // 标签筛选
      if (activeTag.value) {
        memories = memories.filter(memory => 
          memory.tags && memory.tags.includes(activeTag.value)
        );
      }
      
      // 搜索筛选
      if (searchKeyword.value) {
        memories = memoryStore.searchMemories(searchKeyword.value);
      }
      
      return memories;
    });

    // 方法
    const handleSearch = () => {
      // 搜索逻辑已在计算属性中处理
    };

    const filterByTag = (tag) => {
      activeTag.value = tag;
    };

    const goToDetail = (id) => {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      });
    };

    const goToAdd = () => {
      uni.navigateTo({
        url: '/pages/edit/edit'
      });
    };

    const formatTime = (timeString) => {
      const date = new Date(timeString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    return {
      searchKeyword,
      activeTag,
      allTags,
      filteredMemories,
      handleSearch,
      filterByTag,
      goToDetail,
      goToAdd,
      formatTime
    };
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  padding: 10rpx 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.search-btn {
  margin-left: 20rpx;
  padding: 10rpx 30rpx;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.tag-scroll {
  margin-bottom: 20rpx;
  white-space: nowrap;
}

.tag-list {
  display: inline-flex;
  padding: 10rpx 0;
}

.tag-item {
  padding: 10rpx 20rpx;
  margin-right: 20rpx;
  background-color: white;
  border-radius: 30rpx;
  font-size: 24rpx;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.1);
}

.tag-item.active {
  background-color: #007AFF;
  color: white;
}

.memory-list {
  margin-bottom: 120rpx;
}

.memory-card {
  background-color: white;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.memory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.memory-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.memory-time {
  font-size: 24rpx;
  color: #999;
}

.memory-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20rpx;
}

.memory-tags {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  padding: 5rpx 15rpx;
  margin-right: 10rpx;
  background-color: #e0e0e0;
  border-radius: 5rpx;
  font-size: 20rpx;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 40rpx;
  display: block;
}

.add-btn {
  padding: 20rpx 40rpx;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
}

.add-button {
  position: fixed;
  bottom: 50rpx;
  right: 50rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: #007AFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 122, 255, 0.3);
}

.add-icon {
  font-size: 60rpx;
  color: white;
  font-weight: bold;
}
</style>
