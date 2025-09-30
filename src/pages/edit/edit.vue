<template>
  <view class="container">
    <!-- 标题输入 -->
    <view class="input-group">
      <input 
        class="title-input" 
        placeholder="请输入记忆标题" 
        v-model="formData.title"
        maxlength="50"
      />
      <text class="char-count">{{ formData.title.length }}/50</text>
    </view>

    <!-- 标签输入 -->
    <view class="input-group">
      <view class="label">标签</view>
      <view class="tag-input-area">
        <input 
          class="tag-input" 
          placeholder="输入标签，回车添加" 
          v-model="newTag"
          @confirm="addTag"
        />
        <button class="add-tag-btn" @click="addTag">添加</button>
      </view>
      <view class="selected-tags">
        <view 
          class="tag" 
          v-for="tag in formData.tags" 
          :key="tag"
        >
          {{ tag }}
          <text class="remove-tag" @click="removeTag(tag)">×</text>
        </view>
      </view>
    </view>

    <!-- 内容输入 -->
    <view class="input-group">
      <view class="label">内容</view>
      <textarea 
        class="content-input" 
        placeholder="请输入记忆内容..." 
        v-model="formData.content"
        maxlength="10000"
      />
      <text class="char-count">{{ formData.content.length }}/10000</text>
    </view>

    <!-- 操作按钮 -->
    <view class="action-bar">
      <button class="action-btn cancel-btn" @click="handleCancel">
        取消
      </button>
      <button class="action-btn save-btn" @click="handleSave">
        保存
      </button>
    </view>
  </view>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useMemoryStore } from '@/store';

export default {
  setup() {
    const memoryStore = useMemoryStore();
    const newTag = ref('');
    const isEditing = ref(false);
    const memoryId = ref('');

    const formData = reactive({
      title: '',
      content: '',
      tags: []
    });

    // 获取页面参数
    onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options || {};
      
      memoryId.value = options.id || '';
      
      if (memoryId.value) {
        // 编辑模式
        isEditing.value = true;
        const memory = memoryStore.getMemoryById(memoryId.value);
        if (memory) {
          formData.title = memory.title;
          formData.content = memory.content;
          formData.tags = memory.tags || [];
        }
      }
    });

    // 方法
    const addTag = () => {
      if (newTag.value.trim() && !formData.tags.includes(newTag.value.trim())) {
        formData.tags.push(newTag.value.trim());
        newTag.value = '';
      }
    };

    const removeTag = (tag) => {
      const index = formData.tags.indexOf(tag);
      if (index !== -1) {
        formData.tags.splice(index, 1);
      }
    };

    const handleSave = async () => {
      if (!formData.title.trim()) {
        uni.showToast({
          title: '请输入标题',
          icon: 'none'
        });
        return;
      }

      try {
        if (isEditing.value) {
          // 更新记忆
          await memoryStore.updateMemory(memoryId.value, {
            title: formData.title.trim(),
            content: formData.content.trim(),
            tags: [...formData.tags]
          });
          uni.showToast({
            title: '更新成功',
            icon: 'success'
          });
        } else {
          // 添加新记忆
          await memoryStore.addMemory({
            title: formData.title.trim(),
            content: formData.content.trim(),
            tags: [...formData.tags]
          });
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          });
        }

        setTimeout(() => {
          uni.navigateBack();
        }, 1000);
      } catch (error) {
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    };

    const handleCancel = () => {
      uni.navigateBack();
    };

    return {
      formData,
      newTag,
      isEditing,
      addTag,
      removeTag,
      handleSave,
      handleCancel
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

.input-group {
  background-color: white;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.title-input {
  font-size: 32rpx;
  padding: 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  margin-bottom: 10rpx;
}

.tag-input-area {
  display: flex;
  margin-bottom: 20rpx;
}

.tag-input {
  flex: 1;
  padding: 15rpx 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.add-tag-btn {
  margin-left: 20rpx;
  padding: 15rpx 30rpx;
  background-color: #007AFF;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  position: relative;
  padding: 10rpx 30rpx 10rpx 15rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
  background-color: #e0e0e0;
  border-radius: 5rpx;
  font-size: 24rpx;
  color: #666;
}

.remove-tag {
  position: absolute;
  right: 5rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-weight: bold;
  font-size: 28rpx;
}

.content-input {
  width: 100%;
  min-height: 300rpx;
  padding: 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  line-height: 1.5;
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  display: block;
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

.cancel-btn {
  background-color: #f0f0f0;
  color: #333;
}

.save-btn {
  background-color: #007AFF;
  color: white;
}
</style>
