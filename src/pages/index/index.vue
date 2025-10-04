<template>
  <view class="container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="decoration-pattern"></view>
      <view class="header-content">
        <text class="app-title">记忆仓库</text>
        <text class="app-subtitle">记录美好时光</text>
      </view>
    </view>

    <!-- 搜索区域 -->
    <view class="search-section">
      <view class="search-container">
        <view class="search-input-wrapper">
          <text class="search-icon">🔍</text>
          <input 
            class="search-input" 
            placeholder="搜索记忆标题、内容或标签..." 
            v-model="searchKeyword"
            @confirm="handleSearch"
          />
          <view 
            class="clear-search" 
            v-if="searchKeyword"
            @click="clearSearch"
          >
            ✕
          </view>
        </view>
        <view class="search-suggestions" v-if="!searchKeyword && allTags.length > 0">
          <text class="suggestion-title">热门标签</text>
          <view class="suggestion-tags">
            <view 
              class="suggestion-tag" 
              v-for="tag in allTags.slice(0, 5)" 
              :key="tag"
              @click="searchByTag(tag)"
            >
              {{ tag }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 标签筛选区域 -->
    <view class="filter-section" v-if="allTags.length > 0">
      <scroll-view class="tag-scroll" scroll-x show-scrollbar="false">
        <view class="tag-filter-list">
          <view 
            class="tag-filter-item" 
            :class="{ active: activeTag === '' }"
            @click="filterByTag('')"
          >
            <text class="tag-icon">📚</text>
            <text class="tag-text">全部</text>
            <text class="tag-count">{{ memoryStore.memories.length }}</text>
          </view>
          <view 
            class="tag-filter-item" 
            :class="{ active: activeTag === tag }"
            v-for="tag in allTags" 
            :key="tag"
            @click="filterByTag(tag)"
          >
            <text class="tag-icon">🏷️</text>
            <text class="tag-text">{{ tag }}</text>
            <text class="tag-count">{{ getTagCount(tag) }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-section" v-if="memoryStore.memories.length > 0">
      <view class="stats-card">
        <view class="stat-item">
          <text class="stat-number">{{ memoryStore.memories.length }}</text>
          <text class="stat-label">总记忆</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-number">{{ allTags.length }}</text>
          <text class="stat-label">标签数</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-number">{{ getTodayCount() }}</text>
          <text class="stat-label">今日新增</text>
        </view>
      </view>
    </view>

    <!-- 记忆列表 -->
    <view class="memory-list">
      <!-- 列表标题 -->
      <view class="list-header" v-if="filteredMemories.length > 0">
        <text class="list-title">
          {{ activeTag ? `${activeTag} 相关记忆` : '所有记忆' }}
        </text>
        <text class="list-count">{{ filteredMemories.length }} 条</text>
      </view>

      <!-- 记忆卡片 -->
      <view 
        class="memory-card" 
        v-for="memory in filteredMemories" 
        :key="memory.id"
        @click="goToDetail(memory.id)"
      >
        <view class="card-header">
          <view class="card-title-section">
            <text class="memory-title">{{ memory.title }}</text>
            <view class="memory-meta">
              <text class="memory-time">{{ formatTime(memory.updateTime) }}</text>
              <text class="memory-date">{{ formatDate(memory.updateTime) }}</text>
            </view>
          </view>
          <view class="card-indicator">
            <text class="indicator-dot"></text>
          </view>
        </view>
        
        <view class="card-content">
          <text class="memory-content">{{ getContentPreview(memory.content) }}</text>
        </view>
        
        <view class="card-footer" v-if="memory.tags && memory.tags.length > 0">
          <view class="memory-tags">
            <view 
              class="memory-tag" 
              v-for="tag in memory.tags.slice(0, 3)" 
              :key="tag"
            >
              {{ tag }}
            </view>
            <view 
              class="more-tags" 
              v-if="memory.tags.length > 3"
            >
              +{{ memory.tags.length - 3 }}
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredMemories.length === 0">
        <view class="empty-illustration">
          <text class="empty-emoji">📝</text>
        </view>
        <text class="empty-title">{{ getEmptyTitle() }}</text>
        <text class="empty-description">{{ getEmptyDescription() }}</text>
        <button class="empty-action-btn" @click="goToAdd" v-if="!activeTag && !searchKeyword">
          <text class="btn-text">创建第一个记忆</text>
          <text class="btn-arrow">→</text>
        </button>
        <button class="empty-action-btn secondary" @click="clearFilters" v-else>
          <text class="btn-text">清除筛选</text>
          <text class="btn-arrow">↺</text>
        </button>
      </view>
    </view>

    <!-- 悬浮添加按钮 -->
    <view class="floating-add-button" @click="goToAdd">
      <view class="add-button-inner">
        <text class="add-icon">+</text>
        <view class="add-ripple"></view>
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

    const clearSearch = () => {
      searchKeyword.value = '';
    };

    const searchByTag = (tag) => {
      searchKeyword.value = tag;
    };

    const filterByTag = (tag) => {
      activeTag.value = tag;
      // 如果选择了标签，清除搜索关键词
      if (tag) {
        searchKeyword.value = '';
      }
    };

    const clearFilters = () => {
      activeTag.value = '';
      searchKeyword.value = '';
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
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return '今天';
      } else if (diffDays === 1) {
        return '昨天';
      } else if (diffDays < 7) {
        return `${diffDays}天前`;
      } else {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }
    };

    const formatDate = (timeString) => {
      const date = new Date(timeString);
      return `${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`;
    };

    const getContentPreview = (content) => {
      if (!content) return '';
      return content.length > 120 ? content.substring(0, 120) + '...' : content;
    };

    const getTagCount = (tag) => {
      return memoryStore.memories.filter(memory => 
        memory.tags && memory.tags.includes(tag)
      ).length;
    };

    const getTodayCount = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return memoryStore.memories.filter(memory => {
        const createTime = new Date(memory.createTime);
        return createTime >= today && createTime < tomorrow;
      }).length;
    };

    const getEmptyTitle = () => {
      if (searchKeyword.value) {
        return '没有找到相关记忆';
      } else if (activeTag.value) {
        return `暂无"${activeTag.value}"相关的记忆`;
      } else {
        return '还没有记忆条目';
      }
    };

    const getEmptyDescription = () => {
      if (searchKeyword.value) {
        return '试试其他关键词或清除搜索';
      } else if (activeTag.value) {
        return '选择其他标签或创建新的记忆';
      } else {
        return '开始记录你的第一个美好回忆吧';
      }
    };

    return {
      searchKeyword,
      activeTag,
      allTags,
      filteredMemories,
      memoryStore,
      handleSearch,
      clearSearch,
      searchByTag,
      filterByTag,
      clearFilters,
      goToDetail,
      goToAdd,
      formatTime,
      formatDate,
      getContentPreview,
      getTagCount,
      getTodayCount,
      getEmptyTitle,
      getEmptyDescription
    };
  }
};
</script>

<style scoped>
/* ==================== 容器布局 ==================== */
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
}

/* ==================== 顶部装饰区域 ==================== */
.header-decoration {
  position: relative;
  background: linear-gradient(135deg, #5b8dee 0%, #7ba7f7 100%);
  padding: 48rpx 32rpx 64rpx;
  border-bottom-left-radius: 64rpx;
  border-bottom-right-radius: 64rpx;
  overflow: hidden;
}

.decoration-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
}

.header-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.app-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.app-subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
}

/* ==================== 搜索区域 ==================== */
.search-section {
  margin: -64rpx 32rpx 32rpx;
  position: relative;
  z-index: 2;
}

.search-container {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 10rpx 15rpx -3rpx rgba(0, 0, 0, 0.1), 0 4rpx 6rpx -2rpx rgba(0, 0, 0, 0.05);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 16rpx;
  padding: 24rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input-wrapper:focus-within {
  border-color: #5b8dee;
  background: #ffffff;
  box-shadow: 0 0 0 6rpx rgba(91, 141, 238, 0.1);
}

.search-icon {
  font-size: 32rpx;
  color: #64748b;
  margin-right: 24rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #0f172a;
  background: transparent;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: #94a3b8;
}

.clear-search {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  border-radius: 50rpx;
  font-size: 24rpx;
  color: #64748b;
  transition: all 0.15s cubic-bezier(0.4, 0, 1, 1);
}

.clear-search:hover {
  background: #cbd5e1;
  transform: scale(1.1);
}

.search-suggestions {
  margin-top: 32rpx;
}

.suggestion-title {
  display: block;
  font-size: 24rpx;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 24rpx;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.suggestion-tag {
  padding: 16rpx 24rpx;
  background: #f1f5f9;
  border-radius: 50rpx;
  font-size: 24rpx;
  color: #64748b;
  transition: all 0.15s cubic-bezier(0.4, 0, 1, 1);
}

.suggestion-tag:hover {
  background: #5b8dee;
  color: #ffffff;
  transform: translateY(-2rpx);
}

/* ==================== 标签筛选区域 ==================== */
.filter-section {
  margin: 0 32rpx 32rpx;
}

.tag-scroll {
  white-space: nowrap;
}

.tag-filter-list {
  display: inline-flex;
  gap: 24rpx;
  padding: 16rpx 0;
}

.tag-filter-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx 32rpx;
  background: #ffffff;
  border-radius: 24rpx;
  border: 2rpx solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  box-shadow: 0 1rpx 3rpx 0 rgba(0, 0, 0, 0.1), 0 1rpx 2rpx 0 rgba(0, 0, 0, 0.06);
}

.tag-filter-item:hover {
  border-color: #7ba7f7;
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 6rpx -1rpx rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -1rpx rgba(0, 0, 0, 0.06);
}

.tag-filter-item.active {
  background: linear-gradient(135deg, #5b8dee 0%, #7ba7f7 100%);
  border-color: #5b8dee;
  box-shadow: 0 4rpx 20rpx rgba(91, 141, 238, 0.3);
}

.tag-filter-item.active .tag-icon,
.tag-filter-item.active .tag-text,
.tag-filter-item.active .tag-count {
  color: #ffffff;
}

.tag-icon {
  font-size: 24rpx;
}

.tag-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #0f172a;
}

.tag-count {
  font-size: 20rpx;
  color: #64748b;
  background: rgba(0, 0, 0, 0.05);
  padding: 2rpx 8rpx;
  border-radius: 50rpx;
  min-width: 32rpx;
  text-align: center;
}

.tag-filter-item.active .tag-count {
  background: rgba(255, 255, 255, 0.2);
}

/* ==================== 统计信息 ==================== */
.stats-section {
  margin: 0 32rpx 32rpx;
}

.stats-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 4rpx 6rpx -1rpx rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -1rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #e2e8f0;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #5b8dee;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 20rpx;
  color: #64748b;
  font-weight: 500;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #e2e8f0;
}

/* ==================== 记忆列表 ==================== */
.memory-list {
  margin: 0 32rpx 96rpx;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  padding: 0 16rpx;
}

.list-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.list-count {
  font-size: 24rpx;
  color: #64748b;
  background: #f1f5f9;
  padding: 8rpx 24rpx;
  border-radius: 50rpx;
}

/* ==================== 记忆卡片 ==================== */
.memory-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 1rpx 3rpx 0 rgba(0, 0, 0, 0.1), 0 1rpx 2rpx 0 rgba(0, 0, 0, 0.06);
  border: 1rpx solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.memory-card:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 10rpx 15rpx -3rpx rgba(0, 0, 0, 0.1), 0 4rpx 6rpx -2rpx rgba(0, 0, 0, 0.05);
  border-color: #7ba7f7;
}

.memory-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6rpx;
  height: 100%;
  background: linear-gradient(135deg, #5b8dee 0%, #7ba7f7 100%);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.memory-card:hover::before {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.card-title-section {
  flex: 1;
}

.memory-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8rpx;
  line-height: 1.2;
}

.memory-meta {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.memory-time {
  font-size: 24rpx;
  color: #5b8dee;
  font-weight: 500;
}

.memory-date {
  font-size: 20rpx;
  color: #64748b;
}

.card-indicator {
  width: 24rpx;
  height: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator-dot {
  width: 12rpx;
  height: 12rpx;
  background: #5b8dee;
  border-radius: 50rpx;
  opacity: 0.6;
}

.card-content {
  margin-bottom: 24rpx;
}

.memory-content {
  font-size: 28rpx;
  color: #475569;
  line-height: 1.6;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.memory-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.memory-tag {
  padding: 8rpx 16rpx;
  background: rgba(91, 141, 238, 0.1);
  color: #5b8dee;
  border-radius: 50rpx;
  font-size: 20rpx;
  font-weight: 500;
  border: 1rpx solid rgba(91, 141, 238, 0.2);
  transition: all 0.15s cubic-bezier(0.4, 0, 1, 1);
}

.memory-tag:hover {
  background: rgba(91, 141, 238, 0.2);
  transform: scale(1.05);
}

.more-tags {
  padding: 8rpx 16rpx;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 50rpx;
  font-size: 20rpx;
  font-weight: 500;
}

/* ==================== 空状态 ==================== */
.empty-state {
  text-align: center;
  padding: 96rpx 32rpx;
  background: #ffffff;
  border-radius: 24rpx;
  margin-top: 32rpx;
  box-shadow: 0 1rpx 3rpx 0 rgba(0, 0, 0, 0.1), 0 1rpx 2rpx 0 rgba(0, 0, 0, 0.06);
}

.empty-illustration {
  margin-bottom: 32rpx;
}

.empty-emoji {
  font-size: 120rpx;
  opacity: 0.6;
}

.empty-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 16rpx;
}

.empty-description {
  display: block;
  font-size: 28rpx;
  color: #475569;
  margin-bottom: 64rpx;
  line-height: 1.6;
}

.empty-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg, #5b8dee 0%, #7ba7f7 100%);
  color: #ffffff;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 20rpx rgba(91, 141, 238, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.empty-action-btn:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 32rpx rgba(91, 141, 238, 0.4);
}

.empty-action-btn.secondary {
  background: #f1f5f9;
  color: #0f172a;
  box-shadow: 0 1rpx 3rpx 0 rgba(0, 0, 0, 0.1), 0 1rpx 2rpx 0 rgba(0, 0, 0, 0.06);
}

.empty-action-btn.secondary:hover {
  background: #e2e8f0;
}

.btn-text {
  font-weight: 500;
}

.btn-arrow {
  font-weight: 700;
  transition: transform 0.15s cubic-bezier(0.4, 0, 1, 1);
}

.empty-action-btn:hover .btn-arrow {
  transform: translateX(4rpx);
}

/* ==================== 悬浮添加按钮 ==================== */
.floating-add-button {
  position: fixed;
  bottom: 48rpx;
  right: 48rpx;
  z-index: 1030;
}

.add-button-inner {
  position: relative;
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #5b8dee 0%, #7ba7f7 100%);
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(91, 141, 238, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-add-button:hover .add-button-inner {
  transform: scale(1.1);
  box-shadow: 0 12rpx 40rpx rgba(91, 141, 238, 0.4);
}

.floating-add-button:active .add-button-inner {
  transform: scale(0.95);
}

.add-icon {
  font-size: 48rpx;
  color: #ffffff;
  font-weight: 300;
  z-index: 1;
  position: relative;
}

.add-ripple {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50rpx;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  animation: ripple 2s infinite;
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 750rpx) {
  .header-decoration {
    padding: 32rpx 24rpx 48rpx;
  }
  
  .search-section {
    margin: -48rpx 24rpx 24rpx;
  }
  
  .filter-section,
  .stats-section,
  .memory-list {
    margin: 0 24rpx 24rpx;
  }
  
  .stats-card {
    padding: 24rpx;
  }
  
  .stat-number {
    font-size: 32rpx;
  }
  
  .memory-card {
    padding: 24rpx;
  }
  
  .floating-add-button {
    bottom: 32rpx;
    right: 32rpx;
  }
  
  .add-button-inner {
    width: 96rpx;
    height: 96rpx;
  }
  
  .add-icon {
    font-size: 40rpx;
  }
}
</style>
