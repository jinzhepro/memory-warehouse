<template>
  <view class="container" v-if="memory">
    <!-- 记忆详情 -->
    <view class="memory-detail">
      <view class="memory-header">
        <text class="memory-title">{{ memory.title }}</text>
        <view class="memory-meta">
          <text class="memory-time">创建: {{ formatTime(memory.createTime) }}</text>
          <text class="memory-time">更新: {{ formatTime(memory.updateTime) }}</text>
        </view>
      </view>
      
      <view class="memory-tags" v-if="memory.tags && memory.tags.length > 0">
        <text class="tag" v-for="tag in memory.tags" :key="tag">
          {{ tag }}
        </text>
      </view>
      
      <view class="memory-content">
        <text>{{ memory.content }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-bar">
      <button class="action-btn edit-btn" @click="goToEdit">
        编辑
      </button>
      <button class="action-btn delete-btn" @click="handleDelete">
        删除
      </button>
    </view>
  </view>

  <!-- 加载中 -->
  <view class="loading" v-else>
    <text>加载中...</text>
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

    // 获取页面参数
    onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options || {};
      
      memoryId.value = options.id || '';
      
      if (memoryId.value) {
        memory.value = memoryStore.getMemoryById(memoryId.value);
      }
    });

    // 方法
    const goToEdit = () => {
      uni.navigateTo({
        url: `/pages/edit/edit?id=${memoryId.value}`
      });
    };

    const handleDelete = () => {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个记忆吗？此操作不可撤销。',
        success: async (res) => {
          if (res.confirm) {
            await memoryStore.deleteMemory(memoryId.value);
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1000);
          }
        }
      });
    };

    const formatTime = (timeString) => {
      const date = new Date(timeString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    return {
      memory,
      goToEdit,
      handleDelete,
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

.memory-detail {
  background-color: white;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.memory-header {
  margin-bottom: 30rpx;
}

.memory-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.memory-meta {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #999;
}

.memory-tags {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 30rpx;
}

.tag {
  padding: 8rpx 16rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
  background-color: #e0e0e0;
  border-radius: 5rpx;
  font-size: 22rpx;
  color: #666;
}

.memory-content {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 20rpx;
  background-color: white;
  border-top: 1rpx solid #e0e0e0;
}

.action-btn {
  flex: 1;
  margin: 0 10rpx;
  padding: 20rpx;
  border: none;
  border-radius: 10rpx;
  font-size: 32rpx;
}

.edit-btn {
  background-color: #007AFF;
  color: white;
}

.delete-btn {
  background-color: #FF3B30;
  color: white;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 32rpx;
  color: #999;
}
</style>
