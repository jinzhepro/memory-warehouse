<template>
  <view class="container">
    <!-- 搜索框 -->
    <view class="search-header">
      <view class="search-bar">
        <input 
          class="search-input" 
          placeholder="搜索记忆标题、内容或标签..." 
          v-model="searchKeyword"
          @input="handleSearch"
          focus
        />
        <button class="clear-btn" v-if="searchKeyword" @click="clearSearch">
          清除
        </button>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="search-results" v-if="searchKeyword">
      <view class="result-count">
        找到 {{ searchResults.length }} 个结果
      </view>
      
      <view 
        class="memory-card" 
        v-for="memory in searchResults" 
        :key="memory.id"
        @click="goToDetail(memory.id)"
      >
        <view class="memory-header">
          <text class="memory-title">{{ memory.title }}</text>
          <text class="memory-time">{{ formatTime(memory.updateTime) }}</text>
        </view>
        <view class="memory-content">
          {{ getContentPreview(memory.content, searchKeyword) }}
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

      <!-- 无结果 -->
      <view class="no-results" v-if="searchResults.length === 0">
        <text class="no-results-text">没有找到相关记忆</text>
      </view>
    </view>

    <!-- 热门搜索 -->
    <view class="hot-search" v-else>
      <view class="section-title">热门标签</view>
      <view class="hot-tags">
        <view 
          class="hot-tag" 
          v-for="tag in hotTags" 
          :key="tag"
          @click="searchByTag(tag)"
        >
          {{ tag }}
        </view>
      </view>
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

    // 初始化数据
    onMounted(async () => {
      await memoryStore.initialize();
    });

    // 计算属性
    const searchResults = computed(() => {
      if (!searchKeyword.value.trim()) {
        return [];
      }
      return memoryStore.searchMemories(searchKeyword.value.trim());
    });

    const hotTags = computed(() => {
      // 获取使用频率最高的标签
      const tagCount = {};
      memoryStore.memories.forEach(memory => {
        if (memory.tags && Array.isArray(memory.tags)) {
          memory.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });
        }
      });
      
      return Object.entries(tagCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);
    });

    // 方法
    const handleSearch = () => {
      // 搜索逻辑已在计算属性中处理
    };

    const clearSearch = () => {
      searchKeyword.value = '';
    };

    const searchByTag = (tag) => {
      searchKeyword.value = tag;
    };

    const goToDetail = (id) => {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      });
    };

    const formatTime = (timeString) => {
      const date = new Date(timeString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const getContentPreview = (content, keyword) => {
      if (!content) return '';
      
      const lowerContent = content.toLowerCase();
      const lowerKeyword = keyword.toLowerCase();
      const index = lowerContent.indexOf(lowerKeyword);
      
      if (index === -1) {
        return content.substring(0, 100) + (content.length > 100 ? '...' : '');
      }
      
      const start = Math.max(0, index - 30);
      const end = Math.min(content.length, index + keyword.length + 30);
      let preview = content.substring(start, end);
      
      if (start > 0) preview = '...' + preview;
      if (end < content.length) preview = preview + '...';
      
      return preview;
    };

    return {
      searchKeyword,
      searchResults,
      hotTags,
      handleSearch,
      clearSearch,
      searchByTag,
      goToDetail,
      formatTime,
      getContentPreview
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

.search-header {
  background-color: white;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.search-bar {
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.clear-btn {
  margin-left: 20rpx;
  padding: 20rpx;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.result-count {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  padding: 0 20rpx;
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

.no-results {
  text-align: center;
  padding: 100rpx 0;
}

.no-results-text {
  font-size: 32rpx;
  color: #999;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  padding: 0 20rpx;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  padding: 0 20rpx;
}

.hot-tag {
  padding: 15rpx 25rpx;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
  background-color: white;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #333;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.1);
}
</style>
