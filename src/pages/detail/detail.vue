<template>
  <view class="container" v-if="memory">
    <!-- 记忆详情卡片 -->
    <view class="memory-detail-card">
      <!-- 卡片头部 -->
      <view class="card-header" :class="{ 'pinned-header': memory.isPinned }">
        <view class="header-content">
          <view class="title-row">
            <text class="memory-title">{{ memory.title }}</text>
            <view class="pin-badge" v-if="memory.isPinned">
              <text class="pin-badge-text">📌 置顶</text>
            </view>
          </view>
          <view class="memory-meta">
            <view class="meta-item">
              <text class="meta-icon">🕐</text>
              <text class="meta-text">创建于 {{ formatDateTime(memory.createTime) }}</text>
            </view>
            <view class="meta-item">
              <text class="meta-icon">✏️</text>
              <text class="meta-text">更新于 {{ formatDateTime(memory.updateTime) }}</text>
            </view>
          </view>
        </view>
        <view class="header-decoration">
          <text class="decoration-icon">📝</text>
        </view>
      </view>
      
      <!-- 标签区域 -->
      <view class="tags-section" v-if="memory.tags && memory.tags.length > 0">
        <view class="section-title">
          <text class="title-icon">🏷️</text>
          <text class="title-text">标签</text>
        </view>
        <view class="memory-tags">
          <view 
            class="tag" 
            v-for="tag in memory.tags" 
            :key="tag"
            @click="searchByTag(tag)"
          >
            <text class="tag-text">{{ tag }}</text>
            <text class="tag-icon">#</text>
          </view>
        </view>
      </view>
      
      <!-- 内容区域 -->
      <view class="content-section">
        <view class="section-title">
          <text class="title-icon">📄</text>
          <text class="title-text">内容</text>
        </view>
        <view class="memory-content">
          <text class="content-text">{{ memory.content }}</text>
        </view>
      </view>

      <!-- 统计信息 -->
      <view class="stats-section">
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ memory.content.length }}</text>
            <text class="stat-label">字符数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ memory.tags ? memory.tags.length : 0 }}</text>
            <text class="stat-label">标签数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ getDaysAgo(memory.createTime) }}</text>
            <text class="stat-label">天数前</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-container">
        <button class="action-btn secondary-btn" @click="shareMemory">
          <text class="btn-icon">📤</text>
          <text class="btn-text">分享</text>
        </button>
        <button class="action-btn primary-btn" @click="goToEdit">
          <text class="btn-icon">✏️</text>
          <text class="btn-text">编辑</text>
        </button>
        <button class="action-btn danger-btn" @click="handleDelete">
          <text class="btn-icon">🗑️</text>
          <text class="btn-text">删除</text>
        </button>
      </view>
    </view>

    <!-- 更多操作弹窗 -->
    <view class="more-actions-overlay" v-if="showMore" @click="hideMoreActions">
      <view class="more-actions-panel" @click.stop>
        <view class="panel-header">
          <text class="panel-title">更多操作</text>
          <view class="panel-close" @click="hideMoreActions">
            <text class="close-icon">✕</text>
          </view>
        </view>
        <view class="action-list">
          <view class="action-item" @click="togglePin">
            <text class="action-icon">{{ memory.isPinned ? '📌' : '📍' }}</text>
            <text class="action-text">{{ memory.isPinned ? '取消置顶' : '置顶记忆' }}</text>
          </view>
          <view class="action-item" @click="copyContent">
            <text class="action-icon">📋</text>
            <text class="action-text">复制内容</text>
          </view>
          <view class="action-item" @click="exportMemory">
            <text class="action-icon">💾</text>
            <text class="action-text">导出记忆</text>
          </view>
          <view class="action-item" @click="addToFavorites">
            <text class="action-icon">⭐</text>
            <text class="action-text">添加收藏</text>
          </view>
        </view>
      </view>
    </view>
  </view>

  <!-- 加载状态 -->
  <view class="loading-container" v-else>
    <view class="loading-content">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>

  <!-- 错误状态 -->
  <view class="error-container" v-if="error">
    <view class="error-content">
      <text class="error-emoji">😕</text>
      <text class="error-title">记忆不存在</text>
      <text class="error-description">该记忆可能已被删除或不存在</text>
      <button class="error-action-btn" @click="goBack">
        <text class="btn-text">返回首页</text>
      </button>
    </view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useMemoryStore } from '@/store';

export default {
  setup() {
    const memoryStore = useMemoryStore();
    const memory = ref(null);
    const memoryId = ref('');
    const showMore = ref(false);
    const error = ref(false);

    // 获取页面参数
    onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options || {};
      
      memoryId.value = options.id || '';
      
      if (memoryId.value) {
        const foundMemory = memoryStore.getMemoryById(memoryId.value);
        if (foundMemory) {
          memory.value = foundMemory;
        } else {
          error.value = true;
        }
      } else {
        error.value = true;
      }
    });

    // 导航方法
    const goBack = () => {
      uni.navigateBack();
    };

    const goToEdit = () => {
      uni.navigateTo({
        url: `/pages/edit/edit?id=${memoryId.value}`
      });
    };

    // 更多操作
    const showMoreActions = () => {
      showMore.value = true;
    };

    const hideMoreActions = () => {
      showMore.value = false;
    };

    // 功能方法
    const handleDelete = () => {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个记忆吗？此操作不可撤销。',
        success: async (res) => {
          if (res.confirm) {
            try {
              await memoryStore.deleteMemory(memoryId.value);
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              });
              setTimeout(() => {
                uni.navigateBack();
              }, 1000);
            } catch (error) {
              uni.showToast({
                title: '删除失败',
                icon: 'error'
              });
            }
          }
        }
      });
    };

    const shareMemory = () => {
      if (!memory.value) return;
      
      const shareText = `${memory.value.title}\n\n${memory.value.content}`;
      
      // #ifdef MP-WEIXIN
      uni.showShareMenu({
        withShareTicket: true,
        success: function () {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          });
        }
      });
      // #endif
      
      // #ifndef MP-WEIXIN
      uni.setClipboardData({
        data: shareText,
        success: function () {
          uni.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          });
        }
      });
      // #endif
    };

    const copyContent = () => {
      if (!memory.value) return;
      
      uni.setClipboardData({
        data: memory.value.content,
        success: function () {
          uni.showToast({
            title: '内容已复制',
            icon: 'success'
          });
          hideMoreActions();
        }
      });
    };

    const exportMemory = () => {
      if (!memory.value) return;
      
      const exportData = JSON.stringify(memory.value, null, 2);
      
      uni.setClipboardData({
        data: exportData,
        success: function () {
          uni.showToast({
            title: '记忆数据已复制',
            icon: 'success'
          });
          hideMoreActions();
        }
      });
    };

    const togglePin = async () => {
      if (!memory.value) return;
      
      try {
        const updatedMemory = await memoryStore.togglePin(memoryId.value);
        if (updatedMemory) {
          memory.value = updatedMemory;
          uni.showToast({
            title: updatedMemory.isPinned ? '已置顶' : '已取消置顶',
            icon: 'success'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '操作失败',
          icon: 'error'
        });
      }
      hideMoreActions();
    };

    const addToFavorites = () => {
      // 这里可以实现收藏功能
      uni.showToast({
        title: '已添加到收藏',
        icon: 'success'
      });
      hideMoreActions();
    };

    const searchByTag = (tag) => {
      uni.navigateTo({
        url: `/pages/index/index?tag=${encodeURIComponent(tag)}`
      });
    };

    // 格式化方法
    const formatDateTime = (timeString) => {
      const date = new Date(timeString);
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return `今天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      } else if (diffDays === 1) {
        return `昨天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      } else if (diffDays < 7) {
        return `${diffDays}天前 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      } else {
        return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }
    };

    const formatTime = (timeString) => {
      const date = new Date(timeString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const getDaysAgo = (timeString) => {
      const date = new Date(timeString);
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    return {
      memory,
      memoryId,
      showMore,
      error,
      goBack,
      goToEdit,
      showMoreActions,
      hideMoreActions,
      handleDelete,
      shareMemory,
      copyContent,
      exportMemory,
      addToFavorites,
      togglePin,
      searchByTag,
      formatDateTime,
      formatTime,
      getDaysAgo
    };
  }
};
</script>

<style scoped>
/* ==================== 容器布局 ==================== */
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  padding-top: 32rpx;
  padding-bottom: 160rpx;
}

/* ==================== 记忆详情卡片 ==================== */
.memory-detail-card {
  margin: 32rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 6rpx -1rpx rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -1rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #e2e8f0;
  overflow: hidden;
}

/* ==================== 卡片头部 ==================== */
.card-header {
  position: relative;
  padding: 48rpx 32rpx 32rpx;
  background: linear-gradient(135deg, #5b8dee 0%, #7ba7f7 100%);
  color: #ffffff;
}

.card-header.pinned-header {
  background: linear-gradient(135deg, #ffc107 0%, #ffca28 100%);
}

.header-content {
  position: relative;
  z-index: 2;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.memory-title {
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.3;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  flex: 1;
}

.pin-badge {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 16rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50rpx;
  backdrop-filter: blur(10rpx);
}

.pin-badge-text {
  font-size: 20rpx;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

.memory-meta {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.meta-icon {
  font-size: 24rpx;
  opacity: 0.9;
}

.meta-text {
  font-size: 24rpx;
  opacity: 0.9;
  font-weight: 400;
}

.header-decoration {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  opacity: 0.3;
}

.decoration-icon {
  font-size: 80rpx;
}

/* ==================== 内容区域 ==================== */
.tags-section,
.content-section,
.stats-section {
  padding: 32rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.tags-section:last-child,
.content-section:last-child,
.stats-section:last-child {
  border-bottom: none;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.title-icon {
  font-size: 28rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

/* ==================== 标签区域 ==================== */
.memory-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: rgba(91, 141, 238, 0.1);
  border: 1rpx solid rgba(91, 141, 238, 0.2);
  border-radius: 50rpx;
  transition: all 0.2s;
}

.tag:hover {
  background: rgba(91, 141, 238, 0.2);
  transform: translateY(-2rpx);
}

.tag-text {
  font-size: 24rpx;
  color: #5b8dee;
  font-weight: 500;
}

.tag-icon {
  font-size: 20rpx;
  color: #5b8dee;
  opacity: 0.7;
}

/* ==================== 内容区域 ==================== */
.memory-content {
  background: #f8fafc;
  border-radius: 16rpx;
  padding: 24rpx;
  border: 1rpx solid #e2e8f0;
}

.content-text {
  font-size: 28rpx;
  color: #334155;
  line-height: 1.7;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* ==================== 统计信息 ==================== */
.stats-section {
  background: #f8fafc;
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
  font-size: 36rpx;
  font-weight: 700;
  color: #5b8dee;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 20rpx;
  color: #64748b;
  font-weight: 500;
}

/* ==================== 底部操作栏 ==================== */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-top: 1rpx solid rgba(226, 232, 240, 0.5);
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + 68rpx); /* 兼容微信小程序的安全区域 */
  z-index: 100;
}

.action-container {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 16rpx;
  border-radius: 16rpx;
  border: none;
  font-size: 24rpx;
  font-weight: 500;
  transition: all 0.2s;
  min-height: 96rpx;
}

.action-btn:active {
  transform: scale(0.95);
}

.btn-icon {
  font-size: 32rpx;
  margin-bottom: 8rpx;
}

.btn-text {
  font-size: 20rpx;
}

.secondary-btn {
  background: #f1f5f9;
  color: #475569;
}

.secondary-btn:hover {
  background: #e2e8f0;
}

.primary-btn {
  background: linear-gradient(135deg, #5b8dee 0%, #7ba7f7 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(91, 141, 238, 0.3);
}

.primary-btn:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 32rpx rgba(91, 141, 238, 0.4);
}

.danger-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 107, 0.3);
}

.danger-btn:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 107, 0.4);
}

/* ==================== 更多操作弹窗 ==================== */
.more-actions-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.3s;
}

.more-actions-panel {
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  width: 100%;
  max-height: 80vh;
  animation: slideUp 0.3s;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.panel-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.panel-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50rpx;
  transition: background-color 0.2s;
}

.panel-close:hover {
  background: #e2e8f0;
}

.close-icon {
  font-size: 24rpx;
  color: #64748b;
}

.action-list {
  padding: 16rpx 0;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  transition: background-color 0.2s;
}

.action-item:hover {
  background: #f8fafc;
}

.action-icon {
  font-size: 32rpx;
  width: 48rpx;
  text-align: center;
}

.action-text {
  font-size: 28rpx;
  color: #334155;
  font-weight: 500;
}

/* ==================== 加载状态 ==================== */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.loading-spinner {
  width: 64rpx;
  height: 64rpx;
  border: 4rpx solid #e2e8f0;
  border-top: 4rpx solid #5b8dee;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 28rpx;
  color: #64748b;
}

/* ==================== 错误状态 ==================== */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 32rpx;
}

.error-content {
  text-align: center;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 64rpx 48rpx;
  box-shadow: 0 4rpx 6rpx -1rpx rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -1rpx rgba(0, 0, 0, 0.06);
  max-width: 600rpx;
  width: 100%;
}

.error-emoji {
  font-size: 120rpx;
  margin-bottom: 24rpx;
  display: block;
}

.error-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 16rpx;
  display: block;
}

.error-description {
  font-size: 28rpx;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 48rpx;
  display: block;
}

.error-action-btn {
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

.error-action-btn:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 32rpx rgba(91, 141, 238, 0.4);
}

/* ==================== 动画 ==================== */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 750rpx) {
  .memory-detail-card {
    margin: 24rpx;
  }
  
  .card-header {
    padding: 32rpx 24rpx 24rpx;
  }
  
  .memory-title {
    font-size: 32rpx;
  }
  
  .tags-section,
  .content-section,
  .stats-section {
    padding: 24rpx;
  }
  
  .action-container {
    gap: 12rpx;
  }
  
  .action-btn {
    padding: 16rpx 12rpx;
    min-height: 80rpx;
  }
  
  .btn-icon {
    font-size: 28rpx;
  }
  
  .btn-text {
    font-size: 18rpx;
  }
}
</style>
