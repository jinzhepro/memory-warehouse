<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="navbar-content">
        <view class="nav-left" @click="handleCancel">
          <text class="nav-icon">✕</text>
        </view>
        <view class="nav-center">
          <text class="nav-title">{{ isEditing ? '编辑记忆' : '创建记忆' }}</text>
        </view>
        <view class="nav-right">
          <view class="nav-save" @click="handleSave" :class="{ disabled: !canSave }">
            <!-- <text class="save-text">保存</text> -->
          </view>
        </view>
      </view>
    </view>

    <!-- 编辑表单 -->
    <view class="edit-form">
      <!-- 标题输入区域 -->
      <view class="form-section">
        <view class="section-header">
          <view class="section-title">
            <text class="title-icon">📝</text>
            <text class="title-text">标题</text>
            <text class="title-required">*</text>
          </view>
          <view class="char-counter">
            <text class="counter-text">{{ formData.title.length }}/50</text>
          </view>
        </view>
        <view class="input-wrapper">
          <input 
            class="title-input" 
            placeholder="给你的记忆起个标题..." 
            v-model="formData.title"
            maxlength="50"
            :class="{ error: errors.title }"
          />
          <view class="input-focus-line"></view>
        </view>
        <text class="error-text" v-if="errors.title">{{ errors.title }}</text>
      </view>

      <!-- 标签输入区域 -->
      <view class="form-section">
        <view class="section-header">
          <view class="section-title">
            <text class="title-icon">🏷️</text>
            <text class="title-text">标签</text>
            <text class="title-optional">可选</text>
          </view>
        </view>
        <view class="tag-input-wrapper">
          <view class="tag-input-area">
            <input 
              class="tag-input" 
              placeholder="输入标签，回车添加..." 
              v-model="newTag"
              @confirm="addTag"
              maxlength="20"
            />
            <button class="add-tag-btn" @click="addTag" :disabled="!newTag.trim()">
              <text class="add-icon">+</text>
            </button>
          </view>
          <view class="selected-tags" v-if="formData.tags.length > 0">
            <view 
              class="tag-item" 
              v-for="(tag, index) in formData.tags" 
              :key="tag"
            >
              <text class="tag-text">{{ tag }}</text>
              <text class="tag-remove" @click="removeTag(index)">×</text>
            </view>
          </view>
          <view class="tag-suggestions" v-if="suggestedTags.length > 0 && formData.tags.length < 5">
            <text class="suggestion-title">推荐标签</text>
            <view class="suggestion-list">
              <view 
                class="suggestion-tag" 
                v-for="tag in suggestedTags" 
                :key="tag"
                @click="addSuggestedTag(tag)"
              >
                {{ tag }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 内容输入区域 -->
      <view class="form-section">
        <view class="section-header">
          <view class="section-title">
            <text class="title-icon">📄</text>
            <text class="title-text">内容</text>
            <text class="title-required">*</text>
          </view>
          <view class="char-counter">
            <text class="counter-text">{{ formData.content.length }}/10000</text>
          </view>
        </view>
        <view class="input-wrapper">
          <textarea 
            class="content-input" 
            placeholder="记录下这个美好的时刻..." 
            v-model="formData.content"
            maxlength="10000"
            :class="{ error: errors.content }"
            auto-height
          />
          <view class="input-focus-line"></view>
        </view>
        <text class="error-text" v-if="errors.content">{{ errors.content }}</text>
        
        <!-- 内容工具栏 -->
        <view class="content-toolbar">
          <view class="toolbar-item" @click="insertTemplate('diary')">
            <text class="toolbar-icon">📔</text>
            <text class="toolbar-text">日记</text>
          </view>
          <view class="toolbar-item" @click="insertTemplate('note')">
            <text class="toolbar-icon">📋</text>
            <text class="toolbar-text">笔记</text>
          </view>
          <view class="toolbar-item" @click="insertTemplate('idea')">
            <text class="toolbar-icon">💡</text>
            <text class="toolbar-text">想法</text>
          </view>
          <view class="toolbar-item" @click="clearContent">
            <text class="toolbar-icon">🗑️</text>
            <text class="toolbar-text">清空</text>
          </view>
        </view>
      </view>

      <!-- 统计信息 -->
      <view class="form-section stats-section" v-if="formData.content.length > 0">
        <view class="section-header">
          <view class="section-title">
            <text class="title-icon">📊</text>
            <text class="title-text">统计</text>
          </view>
        </view>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ formData.content.length }}</text>
            <text class="stat-label">字符数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ getWordCount() }}</text>
            <text class="stat-label">字数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ getLineCount() }}</text>
            <text class="stat-label">行数</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-container">
        <button class="action-btn secondary-btn" @click="handleCancel">
          <text class="btn-text">取消</text>
        </button>
        <button class="action-btn primary-btn" @click="handleSave" :class="{ disabled: !canSave }">
          <text class="btn-text">{{ isEditing ? '更新' : '保存' }}</text>
        </button>
      </view>
    </view>

    <!-- 保存确认弹窗 -->
    <view class="confirm-overlay" v-if="showConfirm" @click="hideConfirm">
      <view class="confirm-panel" @click.stop>
        <view class="confirm-header">
          <text class="confirm-icon">💾</text>
          <text class="confirm-title">确认保存</text>
        </view>
        <view class="confirm-content">
          <text class="confirm-message">确定要保存这个记忆吗？</text>
        </view>
        <view class="confirm-actions">
          <button class="confirm-btn secondary" @click="hideConfirm">
            <text class="btn-text">取消</text>
          </button>
          <button class="confirm-btn primary" @click="confirmSave">
            <text class="btn-text">确认保存</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useMemoryStore } from '@/store';

export default {
  setup() {
    const memoryStore = useMemoryStore();
    const newTag = ref('');
    const isEditing = ref(false);
    const memoryId = ref('');
    const showConfirm = ref(false);

    const formData = reactive({
      title: '',
      content: '',
      tags: []
    });

    const errors = reactive({
      title: '',
      content: ''
    });

    // 计算属性
    const canSave = computed(() => {
      return formData.title.trim() && formData.content.trim() && !errors.title && !errors.content;
    });

    const suggestedTags = computed(() => {
      const allTags = memoryStore.allTags;
      const currentTags = formData.tags;
      return allTags.filter(tag => !currentTags.includes(tag)).slice(0, 6);
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

    // 验证方法
    const validateForm = () => {
      errors.title = '';
      errors.content = '';

      if (!formData.title.trim()) {
        errors.title = '请输入标题';
        return false;
      }

      if (formData.title.trim().length > 50) {
        errors.title = '标题不能超过50个字符';
        return false;
      }

      if (!formData.content.trim()) {
        errors.content = '请输入内容';
        return false;
      }

      if (formData.content.trim().length > 10000) {
        errors.content = '内容不能超过10000个字符';
        return false;
      }

      return true;
    };

    // 标签相关方法
    const addTag = () => {
      const trimmedTag = newTag.value.trim();
      if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
        formData.tags.push(trimmedTag);
        newTag.value = '';
      }
    };

    const removeTag = (index) => {
      formData.tags.splice(index, 1);
    };

    const addSuggestedTag = (tag) => {
      if (!formData.tags.includes(tag) && formData.tags.length < 10) {
        formData.tags.push(tag);
      }
    };

    // 内容相关方法
    const insertTemplate = (type) => {
      const templates = {
        diary: `日期：${new Date().toLocaleDateString()}\n天气：\n心情：\n\n今天发生了什么：\n\n`,
        note: `主题：\n要点：\n1. \n2. \n3. \n\n总结：\n\n`,
        idea: `灵感来源：\n核心想法：\n\n详细描述：\n\n可行性分析：\n\n下一步行动：\n\n`
      };
      
      if (templates[type]) {
        formData.content = templates[type];
      }
    };

    const clearContent = () => {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空内容吗？此操作不可撤销。',
        success: (res) => {
          if (res.confirm) {
            formData.content = '';
          }
        }
      });
    };

    // 统计方法
    const getWordCount = () => {
      if (!formData.content) return 0;
      // 简单的中文字数统计
      return formData.content.replace(/\s/g, '').length;
    };

    const getLineCount = () => {
      if (!formData.content) return 0;
      return formData.content.split('\n').length;
    };

    // 保存相关方法
    const handleSave = () => {
      if (!validateForm()) {
        return;
      }
      showConfirm.value = true;
    };

    const confirmSave = async () => {
      try {
        const memoryData = {
          title: formData.title.trim(),
          content: formData.content.trim(),
          tags: [...formData.tags]
        };

        if (isEditing.value) {
          // 更新记忆
          await memoryStore.updateMemory(memoryId.value, memoryData);
          uni.showToast({
            title: '更新成功',
            icon: 'success'
          });
        } else {
          // 添加新记忆
          await memoryStore.addMemory(memoryData);
          uni.showToast({
            title: '创建成功',
            icon: 'success'
          });
        }

        setTimeout(() => {
          uni.navigateBack();
        }, 1000);
      } catch (error) {
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'error'
        });
      }
    };

    const hideConfirm = () => {
      showConfirm.value = false;
    };

    const handleCancel = () => {
      // 检查是否有未保存的更改
      const hasChanges = formData.title.trim() || formData.content.trim() || formData.tags.length > 0;
      
      if (hasChanges) {
        uni.showModal({
          title: '确认离开',
          content: '您有未保存的更改，确定要离开吗？',
          success: (res) => {
            if (res.confirm) {
              uni.navigateBack();
            }
          }
        });
      } else {
        uni.navigateBack();
      }
    };

    return {
      formData,
      newTag,
      isEditing,
      showConfirm,
      errors,
      canSave,
      suggestedTags,
      addTag,
      removeTag,
      addSuggestedTag,
      insertTemplate,
      clearContent,
      getWordCount,
      getLineCount,
      handleSave,
      confirmSave,
      hideConfirm,
      handleCancel
    };
  }
};
</script>

<style scoped>
/* ==================== 容器布局 ==================== */
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  padding-bottom: 160rpx;
}

/* ==================== 顶部导航栏 ==================== */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border-bottom: 1rpx solid rgba(226, 232, 240, 0.5);
  padding-top: var(--status-bar-height, 44rpx); /* 状态栏高度适配 */
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  min-height: 88rpx;
}

.nav-left, .nav-right {
  width: 120rpx;
  display: flex;
  align-items: center;
}

.nav-left {
  justify-content: flex-start;
}

.nav-right {
  justify-content: flex-end;
}

.nav-center {
  flex: 1;
  text-align: center;
}

.nav-icon {
  font-size: 32rpx;
  color: #64748b;
  padding: 8rpx;
  border-radius: 8rpx;
  transition: all 0.2s;
}

.nav-left:active .nav-icon {
  background: #f1f5f9;
  transform: scale(0.95);
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.nav-save {
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #5b8dee 0%, #7ba7f7 100%);
  border-radius: 16rpx;
  transition: all 0.2s;
}

.nav-save.disabled {
  background: #e2e8f0;
  opacity: 0.6;
}

.nav-save:active:not(.disabled) {
  transform: scale(0.95);
}

.save-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
}

.nav-save.disabled .save-text {
  color: #94a3b8;
}

/* ==================== 编辑表单 ==================== */
.edit-form {
  padding: 32rpx;
}

.form-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 6rpx -1rpx rgba(0, 0, 0, 0.1), 0 2rpx 4rpx -1rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #e2e8f0;
}

/* ==================== 表单区域 ==================== */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.title-icon {
  font-size: 28rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.title-required {
  font-size: 20rpx;
  color: #ef4444;
  font-weight: 500;
}

.title-optional {
  font-size: 20rpx;
  color: #64748b;
  font-weight: 400;
}

.char-counter {
  background: #f1f5f9;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}

.counter-text {
  font-size: 20rpx;
  color: #64748b;
  font-weight: 500;
}

/* ==================== 输入框样式 ==================== */
.input-wrapper {
  position: relative;
}

.title-input,
.content-input {
  width: 100%;
  padding: 24rpx;
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #0f172a;
  transition: all 0.2s;
  box-sizing: border-box;
}

.title-input {
  height: 96rpx;
  line-height: 48rpx;
}

.content-input {
  min-height: 200rpx;
  line-height: 1.6;
  resize: none;
}

.title-input:focus,
.content-input:focus {
  border-color: #5b8dee;
  background: #ffffff;
  box-shadow: 0 0 0 6rpx rgba(91, 141, 238, 0.1);
  outline: none;
}

.title-input.error,
.content-input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.title-input::placeholder,
.content-input::placeholder {
  color: #94a3b8;
}

.input-focus-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2rpx;
  background: linear-gradient(90deg, #5b8dee 0%, #7ba7f7 100%);
  transform: scaleX(0);
  transition: transform 0.3s;
}

.title-input:focus + .input-focus-line,
.content-input:focus + .input-focus-line {
  transform: scaleX(1);
}

.error-text {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #ef4444;
  font-weight: 500;
}

/* ==================== 标签输入区域 ==================== */
.tag-input-wrapper {
  margin-top: 8rpx;
}

.tag-input-area {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.tag-input {
  flex: 1;
  padding: 20rpx 24rpx;
  background: #f8fafc;
  border: 2rpx solid #e2e8f0;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #0f172a;
  transition: all 0.2s;
}

.tag-input:focus {
  border-color: #5b8dee;
  background: #ffffff;
  box-shadow: 0 0 0 6rpx rgba(91, 141, 238, 0.1);
  outline: none;
}

.tag-input::placeholder {
  color: #94a3b8;
}

.add-tag-btn {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #5b8dee 0%, #7ba7f7 100%);
  border: none;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 4rpx 20rpx rgba(91, 141, 238, 0.3);
}

.add-tag-btn:disabled {
  background: #e2e8f0;
  box-shadow: none;
}

.add-tag-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.add-icon {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 300;
}

.add-tag-btn:disabled .add-icon {
  color: #94a3b8;
}

/* ==================== 已选标签 ==================== */
.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 24rpx;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: linear-gradient(135deg, rgba(91, 141, 238, 0.1) 0%, rgba(123, 167, 247, 0.1) 100%);
  border: 1rpx solid rgba(91, 141, 238, 0.2);
  border-radius: 50rpx;
  transition: all 0.2s;
}

.tag-item:hover {
  background: rgba(91, 141, 238, 0.2);
  transform: translateY(-2rpx);
}

.tag-text {
  font-size: 24rpx;
  color: #5b8dee;
  font-weight: 500;
}

.tag-remove {
  font-size: 28rpx;
  color: #64748b;
  padding: 4rpx;
  border-radius: 50rpx;
  transition: all 0.2s;
}

.tag-remove:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* ==================== 推荐标签 ==================== */
.tag-suggestions {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f1f5f9;
}

.suggestion-title {
  font-size: 24rpx;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 16rpx;
  display: block;
}

.suggestion-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.suggestion-tag {
  padding: 12rpx 20rpx;
  background: #f1f5f9;
  border: 1rpx solid #e2e8f0;
  border-radius: 50rpx;
  font-size: 24rpx;
  color: #475569;
  transition: all 0.2s;
}

.suggestion-tag:hover {
  background: #5b8dee;
  color: #ffffff;
  border-color: #5b8dee;
  transform: translateY(-2rpx);
}

/* ==================== 内容工具栏 ==================== */
.content-toolbar {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f1f5f9;
}

.toolbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 12rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  transition: all 0.2s;
}

.toolbar-item:hover {
  background: #5b8dee;
  border-color: #5b8dee;
}

.toolbar-item:hover .toolbar-icon,
.toolbar-item:hover .toolbar-text {
  color: #ffffff;
}

.toolbar-icon {
  font-size: 32rpx;
  color: #64748b;
  transition: color 0.2s;
}

.toolbar-text {
  font-size: 20rpx;
  color: #64748b;
  font-weight: 500;
  transition: color 0.2s;
}

/* ==================== 统计信息 ==================== */
.stats-section {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
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
  padding: 20rpx;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:active {
  transform: scale(0.95);
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

.primary-btn:hover:not(.disabled) {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 32rpx rgba(91, 141, 238, 0.4);
}

.primary-btn.disabled {
  background: #e2e8f0;
  color: #94a3b8;
  box-shadow: none;
}

.btn-text {
  font-weight: 500;
}

/* ==================== 确认弹窗 ==================== */
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
}

.confirm-panel {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  margin: 32rpx;
  max-width: 600rpx;
  width: 100%;
  box-shadow: 0 20rpx 25rpx -5rpx rgba(0, 0, 0, 0.1), 0 10rpx 10rpx -5rpx rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s;
}

.confirm-header {
  text-align: center;
  margin-bottom: 32rpx;
}

.confirm-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
  display: block;
}

.confirm-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
  display: block;
}

.confirm-content {
  text-align: center;
  margin-bottom: 48rpx;
}

.confirm-message {
  font-size: 28rpx;
  color: #475569;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 16rpx;
}

.confirm-btn {
  flex: 1;
  padding: 20rpx;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.2s;
}

.confirm-btn:active {
  transform: scale(0.95);
}

.confirm-btn.secondary {
  background: #f1f5f9;
  color: #475569;
}

.confirm-btn.secondary:hover {
  background: #e2e8f0;
}

.confirm-btn.primary {
  background: linear-gradient(135deg, #5b8dee 0%, #7ba7f7 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(91, 141, 238, 0.3);
}

.confirm-btn.primary:hover {
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
    transform: translateY(100rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 750rpx) {
  .edit-form {
    padding: 24rpx;
  }
  
  .form-section {
    padding: 24rpx;
  }
  
  .content-toolbar {
    flex-wrap: wrap;
  }
  
  .toolbar-item {
    flex: 0 0 calc(50% - 8rpx);
  }
  
  .action-container {
    gap: 12rpx;
  }
  
  .confirm-panel {
    margin: 24rpx;
    padding: 32rpx 24rpx;
  }
}
</style>
