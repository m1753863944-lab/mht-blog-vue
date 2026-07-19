<template>
  <!-- 全局大外框容器 -->
  <div class="ali-site-frame">
    <div class="ali-content-wrapper">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  /* Ali Abdaal 经典的温暖纸张色衬底 */
  background-color: #f7f4eb; 
  color: #1c1917;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  padding: 30px; /* 留出外围四周的空隙，让大框有悬浮感 */
}

/* 核心：包裹全站内容的精致大外框 */
.ali-site-frame {
  max-width: 1300px;
  margin: 0 auto;
  background-color: #fdfbf7; /* 内层白纸色 */
  border: 1px solid #e7e3d4; /* 细腻的古典边框线 */
  border-radius: 12px;
  box-shadow: 0 4px 30px rgba(28, 25, 23, 0.03);
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.ali-content-wrapper {
  padding: 50px 60px;
  flex: 1;
}

/* 优雅的淡入动效 */
.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 移动端安全适配：窄屏时去掉外边距 */
@media (max-width: 768px) {
  body { padding: 0; }
  .ali-site-frame { border-radius: 0; border: none; min-height: 100vh; }
  .ali-content-wrapper { padding: 30px 20px; }
}
</style>
