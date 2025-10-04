<script>
export default {
  onLaunch: function () {
    console.log('记忆仓库 App 启动');
    
    // 获取状态栏高度并设置CSS变量
    this.setStatusBarHeight();
    
    // 可以在这里添加全局初始化代码
  },
  onShow: function () {
    console.log('记忆仓库 App 显示');
  },
  onHide: function () {
    console.log('记忆仓库 App 隐藏');
  },
  methods: {
    setStatusBarHeight() {
      try {
        // 获取系统信息
        const systemInfo = uni.getSystemInfoSync();
        const statusBarHeight = systemInfo.statusBarHeight || 0;
        
        // 将状态栏高度转换为rpx单位（假设设计稿是750rpx宽度）
        const screenWidth = systemInfo.screenWidth || 375;
        const rpxRatio = 750 / screenWidth;
        const statusBarHeightInRpx = Math.round(statusBarHeight * rpxRatio);
        
        // 设置CSS变量
        document.documentElement.style.setProperty('--status-bar-height', `${statusBarHeightInRpx}rpx`);
        
        console.log(`状态栏高度: ${statusBarHeight}px (${statusBarHeightInRpx}rpx)`);
      } catch (error) {
        console.error('获取状态栏高度失败:', error);
        // 设置默认值
        document.documentElement.style.setProperty('--status-bar-height', '44rpx');
      }
    }
  }
};
</script>

<style>
/* 每个页面公共css */
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 全局按钮样式 */
button {
  border-radius: 8rpx;
}

button::after {
  border: none;
}

/* 全局输入框样式 */
input, textarea {
  outline: none;
}

/* 全局文本样式 */
text {
  word-wrap: break-word;
}
</style>
