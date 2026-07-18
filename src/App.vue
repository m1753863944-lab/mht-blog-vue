<template>
  <div class="app-shell">
    <!-- 纯粹的路由视窗外壳，不再挂载任何多余的全局提示框 -->
    <router-view></router-view>
  </div>
</template>

<script setup>
// 移除了报错组件依赖，保持外壳组件绝对干净
</script>

<style>
/* 保持全局冷白高智感基调不变 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  background-color: #fbfbfb;
  color: #111111;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 50px 60px 100px 60px;
}
.btn-link {
  color: #111;
  text-decoration: none;
  font-family: monospace;
  border-bottom: 1px dashed #aaa;
  padding-bottom: 2px;
}
.btn-link:hover {
  border-bottom-color: #111;
}

/* 优雅的淡入微动效 */
.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
