<template>
  <view class="container">
    <!-- 顶部装饰区域 -->
    <view class="header-decoration">
      <view class="decoration-pattern"></view>
      <view class="header-content">
        <text class="app-title">搜索记忆</text>
        <text class="app-subtitle">发现你的美好回忆</text>
      </view>
    </view>

    <!-- 搜索区域 -->
    <view class="search-section">
      <view class="search-container">
        <view class="search-input-wrapper">
          <uni-icons class="search-icon" type="search" size="16" color="#999"></uni-icons>
          <input 
            class="search-input" 
            placeholder="搜索记忆标题、内容或标签..." 
            v-model="searchKeyword"
            @input="handleSearch"
            focus
          />
          <view 
            class="clear-search" 
            v-if="searchKeyword"
            @click="clearSearch"
          >
            <uni-icons type="closeempty" size="14" color="#999"></uni-icons>
          </view>
        </view>
        
        <!-- 搜索建议 -->
        <view class="search-suggestions" v-if="!searchKeyword && recentSearches.length > 0">
          <view class="suggestion-header">
            <text class="suggestion-title">最近搜索</text>
            <text class="clear-history" @click="clearHistory">清除</text>
          </view>
          <view class="recent-searches">
            <view 
              class="recent-search-item" 
              v-for="item in recentSearches" 
              :key="item"
              @click="searchByKeyword(item)"
            >
              <uni-icons class="search-history-icon" type="time" size="12" color="#999"></uni-icons>
              <text class="search-text">{{ item }}</text>
              <uni-icons class="search-remove" type="closeempty" size="12" color="#999" @click.stop="removeFromHistory(item)"></uni-icons>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 搜索过滤器 -->
    <view class="filter-section" v-if="searchKeyword">
      <view class="filter-tabs">
        <view 
          class="filter-tab" 
          :class="{ active: activeFilter === 'all' }"
          @click="setFilter('all')"
        >
          <uni-icons class="filter-icon" type="list" size="14" color="#666"></uni-icons>
          <text class="filter-text">全部</text>
          <text class="filter-count">{{ searchResults.length }}</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: activeFilter === 'title' }"
          @click="setFilter('title')"
        >
          <uni-icons class="filter-icon" type="compose" size="14" color="#666"></uni-icons>
          <text class="filter-text">标题</text>
          <text class="filter-count">{{ getTitleResults().length }}</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: activeFilter === 'content' }"
          @click="setFilter('content')"
        >
          <uni-icons class="filter-icon" type="document-text" size="14" color="#666"></uni-icons>
          <text class="filter-text">内容</text>
          <text class="filter-count">{{ getContentResults().length }}</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: activeFilter === 'tag' }"
          @click="setFilter('tag')"
        >
          <uni-icons class="filter-icon" type="tag" size="14" color="#666"></uni-icons>
          <text class="filter-text">标签</text>
          <text class="filter-count">{{ getTagResults().length }}</text>
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="search-results" v-if="searchKeyword">
      <!-- 结果统计 -->
      <view class="result-header">
        <text class="result-title">
          {{ getFilterTitle() }}
        </text>
        <text class="result-count">
          {{ getFilteredResults().length }} 个结果
        </text>
      </view>
      
      <!-- 结果列表 -->
      <view class="results-list">
        <view 
          class="memory-card" 
          v-for="memory in getFilteredResults()" 
          :key="memory.id"
          @click="goToDetail(memory.id)"
        >
          <view class="card-header">
            <view class="card-title-section">
              <text class="memory-title">{{ highlightKeyword(memory.title) }}</text>
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
            <text class="memory-content">{{ highlightKeyword(getContentPreview(memory.content)) }}</text>
          </view>
          
          <view class="card-footer" v-if="memory.tags && memory.tags.length > 0">
            <view class="memory-tags">
              <view 
                class="memory-tag" 
                v-for="tag in memory.tags.slice(0, 3)" 
                :key="tag"
              >
                {{ highlightKeyword(tag) }}
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
      </view>

      <!-- 无结果 -->
      <view class="no-results" v-if="getFilteredResults().length === 0">
        <view class="no-results-illustration">
          <uni-icons class="no-results-emoji" type="search" size="48" color="#ddd"></uni-icons>
        </view>
        <text class="no-results-title">没有找到相关记忆</text>
        <text class="no-results-description">试试其他关键词或检查拼写</text>
        <button class="no-results-action" @click="clearSearch">
          <text class="btn-text">清除搜索</text>
        </button>
      </view>
    </view>

    <!-- 热门搜索 -->
    <view class="hot-search" v-else>
      <!-- 热门标签 -->
      <view class="hot-section" v-if="hotTags.length > 0">
        <view class="section-header">
          <text class="section-title">热门标签</text>
          <text class="section-subtitle">快速发现相关记忆</text>
        </view>
        <view class="hot-tags">
          <view 
            class="hot-tag" 
            v-for="tag in hotTags" 
            :key="tag"
            @click="searchByTag(tag)"
          >
            <text class="tag-icon">#</text>
            <text class="tag-text">{{ tag }}</text>
            <text class="tag-count">{{ getTagCount(tag) }}</text>
          </view>
        </view>
      </view>

      <!-- 搜索统计 -->
      <view class="search-stats">
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ memoryStore.memories.length }}</text>
            <text class="stat-label">总记忆</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ allTags.length }}</text>
            <text class="stat-label">标签数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ getTodayCount() }}</text>
            <text class="stat-label">今日新增</text>
          </view>
        </view>
      </view>

      <!-- 搜索提示 -->
      <view class="search-tips">
        <view class="tips-header">
          <uni-icons class="tips-icon" type="lightbulb" size="16" color="#666"></uni-icons>
          <text class="tips-title">搜索小贴士</text>
        </view>
        <view class="tips-list">
          <view class="tip-item">
            <text class="tip-bullet">•</text>
            <text class="tip-text">使用关键词搜索标题和内容</text>
          </view>
          <view class="tip-item">
            <text class="tip-bullet">•</text>
            <text class="tip-text">点击标签快速筛选相关记忆</text>
          </view>
          <view class="tip-item">
            <text class="tip-bullet">•</text>
            <text class="tip-text">搜索结果会高亮显示匹配内容</text>
          </view>
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
    const activeFilter = ref('all');
    const recentSearches = ref([]);

    // 初始化数据
    onMounted(async () => {
      await memoryStore.initialize();
      loadRecentSearches();
    });

    // 计算属性
    const allTags = computed(() => memoryStore.allTags);
    
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

    // 过滤结果方法
    const getTitleResults = () => {
      return searchResults.value.filter(memory => 
        memory.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
      );
    };

    const getContentResults = () => {
      return searchResults.value.filter(memory => 
        memory.content.toLowerCase().includes(searchKeyword.value.toLowerCase())
      );
    };

    const getTagResults = () => {
      return searchResults.value.filter(memory => 
        memory.tags && memory.tags.some(tag => 
          tag.toLowerCase().includes(searchKeyword.value.toLowerCase())
        )
      );
    };

    const getFilteredResults = () => {
      switch (activeFilter.value) {
        case 'title':
          return getTitleResults();
        case 'content':
          return getContentResults();
        case 'tag':
          return getTagResults();
        default:
          return searchResults.value;
      }
    };

    const getFilterTitle = () => {
      switch (activeFilter.value) {
        case 'title':
          return '标题匹配';
        case 'content':
          return '内容匹配';
        case 'tag':
          return '标签匹配';
        default:
          return '全部结果';
      }
    };

    // 搜索历史管理
    const loadRecentSearches = () => {
      try {
        const stored = uni.getStorageSync('recent_searches');
        if (stored) {
          recentSearches.value = JSON.parse(stored);
        }
      } catch (error) {
        recentSearches.value = [];
      }
    };

    const saveRecentSearches = () => {
      try {
        uni.setStorageSync('recent_searches', JSON.stringify(recentSearches.value));
      } catch (error) {
        console.error('保存搜索历史失败:', error);
      }
    };

    const addToHistory = (keyword) => {
      if (!keyword.trim()) return;
      
      // 移除已存在的
      const index = recentSearches.value.indexOf(keyword);
      if (index > -1) {
        recentSearches.value.splice(index, 1);
      }
      
      // 添加到开头
      recentSearches.value.unshift(keyword);
      
      // 限制数量
      if (recentSearches.value.length > 10) {
        recentSearches.value = recentSearches.value.slice(0, 10);
      }
      
      saveRecentSearches();
    };

    const removeFromHistory = (keyword) => {
      const index = recentSearches.value.indexOf(keyword);
      if (index > -1) {
        recentSearches.value.splice(index, 1);
        saveRecentSearches();
      }
    };

    const clearHistory = () => {
      uni.showModal({
        title: '确认清除',
        content: '确定要清除所有搜索历史吗？',
        success: (res) => {
          if (res.confirm) {
            recentSearches.value = [];
            saveRecentSearches();
          }
        }
      });
    };

    // 搜索方法
    const handleSearch = () => {
      if (searchKeyword.value.trim()) {
        addToHistory(searchKeyword.value.trim());
      }
    };

    const clearSearch = () => {
      searchKeyword.value = '';
      activeFilter.value = 'all';
    };

    const searchByKeyword = (keyword) => {
      searchKeyword.value = keyword;
      addToHistory(keyword);
    };

    const searchByTag = (tag) => {
      searchKeyword.value = tag;
      activeFilter.value = 'tag';
      addToHistory(tag);
    };

    const setFilter = (filter) => {
      activeFilter.value = filter;
    };

    // 高亮关键词
    const highlightKeyword = (text) => {
      if (!searchKeyword.value.trim() || !text) return text;
      
      const keyword = searchKeyword.value.trim();
      const regex = new RegExp(`(${keyword})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    };

    // 导航方法
    const goToDetail = (id) => {
      uni.navigateTo({
        url: `/pages/detail/detail?id=${id}`
      });
    };

    // 格式化方法
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

    // 统计方法
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

    return {
      searchKeyword,
      activeFilter,
      recentSearches,
      allTags,
      searchResults,
      hotTags,
      getTitleResults,
      getContentResults,
      getTagResults,
      getFilteredResults,
      getFilterTitle,
      loadRecentSearches,
      addToHistory,
      removeFromHistory,
      clearHistory,
      handleSearch,
      clearSearch,
      searchByKeyword,
      searchByTag,
      setFilter,
      highlightKeyword,
      goToDetail,
      formatTime,
      formatDate,
      getContentPreview,
      getTagCount,
      getTodayCount
    };
  }
};
</script>

<style scoped>
/* ==================== 容器布局 ==================== */
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
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

/* ==================== 搜索建议 ==================== */
.search-suggestions {
  margin-top: 32rpx;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.suggestion-title {
  font-size: 24rpx;
  font-weight: 500;
  color: #64748b;
}

.clear-history {
  font-size: 24rpx;
  color: #5b8dee;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  transition: all 0.2s;
}

.clear-history:hover {
  background: rgba(91, 141, 238, 0.1);
}

.recent-searches {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.recent-search-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 20rpx;
  background: #f8fafc;
  border-radius: 12rpx;
  transition: all 0.2s;
}

.recent-search-item:hover {
  background: #e2e8f0;
  transform: translateX(4rpx);
}

.search-history-icon {
  font-size: 24rpx;
  color: #64748b;
}

.search-text {
  flex: 1;
  font-size: 24rpx;
  color: #334155;
}

.search-remove {
  font-size: 20rpx;
  color: #94a3b8;
  padding: 4rpx;
  border-radius: 50rpx;
  transition: all 0.2s;
}

.search-remove:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* ==================== 过滤器区域 ==================== */
.filter-section {
  margin: 0 32rpx 32rpx;
}

.filter-tabs {
  display: flex;
  gap: 16rpx;
  padding: 8rpx;
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 6rpx -1rpx rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -1rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #e2e8f0;
}

.filter-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 12rpx;
  border-radius: 16rpx;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #f8fafc;
}

.filter-tab.active {
  background: linear-gradient(135deg, rgba(91, 141, 238, 0.1) 0%, rgba(123, 167, 247, 0.1) 100%);
}

.filter-icon {
  font-size: 24rpx;
  color: #64748b;
  transition: color 0.2s;
}

.filter-tab.active .filter-icon {
  color: #5b8dee;
}

.filter-text {
  font-size: 20rpx;
  color: #475569;
  font-weight: 500;
  transition: color 0.2s;
}

.filter-tab.active .filter-text {
  color: #5b8dee;
}

.filter-count {
  font-size: 18rpx;
  color: #94a3b8;
  font-weight: 500;
  background: #f1f5f9;
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  min-width: 32rpx;
  text-align: center;
}

.filter-tab.active .filter-count {
  background: rgba(91, 141, 238, 0.2);
  color: #5b8dee;
}

/* ==================== 搜索结果 ==================== */
.search-results {
  margin: 0 32rpx 32rpx;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 16rpx;
}

.result-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.result-count {
  font-size: 24rpx;
  color: #64748b;
  background: #f1f5f9;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.memory-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 6rpx -1rpx rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -1rpx rgba(0, 0, 0, 0.06);
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

/* ==================== 无结果状态 ==================== */
.no-results {
  text-align: center;
  padding: 96rpx 32rpx;
  background: #ffffff;
  border-radius: 24rpx;
  margin-top: 32rpx;
  box-shadow: 0 4rpx 6rpx -1rpx rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -1rpx rgba(0, 0, 0, 0.06);
}

.no-results-illustration {
  margin-bottom: 32rpx;
}

.no-results-emoji {
  font-size: 120rpx;
  opacity: 0.6;
}

.no-results-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 16rpx;
}

.no-results-description {
  display: block;
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 48rpx;
}

.no-results-action {
  display: inline-flex;
  align-items: center;
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, #5b8dee 0%, #7ba7f7 100%);
  color: #ffffff;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 20rpx rgba(91, 141, 238, 0.3);
  transition: all 0.2s;
}

.no-results-action:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 32rpx rgba(91, 141, 238, 0.4);
}

/* ==================== 热门搜索 ==================== */
.hot-search {
  padding: 0 32rpx 32rpx;
}

.hot-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 6rpx -1rpx rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -1rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #e2e8f0;
}

.section-header {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 8rpx;
  display: block;
}

.section-subtitle {
  font-size: 24rpx;
  color: #64748b;
  display: block;
}

.hot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.hot-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1rpx solid #e2e8f0;
  border-radius: 50rpx;
  transition: all 0.2s;
}

.hot-tag:hover {
  background: linear-gradient(135deg, #5b8dee 0%, #7ba7f7 100%);
  border-color: #5b8dee;
  transform: translateY(-2rpx);
}

.hot-tag:hover .tag-icon,
.hot-tag:hover .tag-text,
.hot-tag:hover .tag-count {
  color: #ffffff;
}

.tag-icon {
  font-size: 20rpx;
  color: #64748b;
}

.tag-text {
  font-size: 24rpx;
  color: #334155;
  font-weight: 500;
}

.tag-count {
  font-size: 18rpx;
  color: #64748b;
  background: rgba(0, 0, 0, 0.05);
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  min-width: 32rpx;
  text-align: center;
}

/* ==================== 搜索统计 ==================== */
.search-stats {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 6rpx -1rpx rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -1rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #e2e8f0;
}

.stats-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
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

/* ==================== 搜索提示 ==================== */
.search-tips {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 6rpx -1rpx rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -1rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #e2e8f0;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.tips-icon {
  font-size: 28rpx;
}

.tips-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.tip-bullet {
  font-size: 24rpx;
  color: #5b8dee;
  font-weight: 700;
  line-height: 1.4;
}

.tip-text {
  font-size: 24rpx;
  color: #475569;
  line-height: 1.4;
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
  .search-results,
  .hot-search {
    margin: 0 24rpx 24rpx;
  }
  
  .filter-tabs {
    gap: 8rpx;
    padding: 4rpx;
  }
  
  .filter-tab {
    padding: 12rpx 8rpx;
  }
  
  .filter-icon {
    font-size: 20rpx;
  }
  
  .filter-text {
    font-size: 18rpx;
  }
  
  .hot-tags {
    gap: 12rpx;
  }
  
  .hot-tag {
    padding: 12rpx 20rpx;
  }
  
  .stats-grid {
    flex-direction: column;
    gap: 24rpx;
  }
  
  .stat-item {
    flex: none;
  }
}
</style>
