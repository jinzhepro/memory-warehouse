<script>
export default {
  onLaunch: function () {
    console.log('记忆仓库 App 启动');
    // 可以在这里添加全局初始化代码
  },
  onShow: function () {
    console.log('记忆仓库 App 显示');
  },
  onHide: function () {
    console.log('记忆仓库 App 隐藏');
  },
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
