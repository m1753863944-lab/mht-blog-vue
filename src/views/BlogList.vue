<template>
  <!-- 首页天际控制线方案 + 顶级厂牌 Logo 精修版 -->
  <div class="container animate-fade-in wide-dashboard">
    
    <!-- 首页天际控制线 -->
    <nav class="top-control-line">
      <div class="site-status">
        <template v-if="!blogStore.globalError">
          <span class="status-dot"></span>
          <span class="status-text">MHT_BLOG // LIVE</span>
        </template>
        <template v-else>
          <span class="status-dot-err"></span>
          <span class="status-text-err">STATUS // {{ blogStore.globalError }}</span>
        </template>
      </div>
      <router-link to="/write" class="btn-write-nav">Write Post +</router-link>
    </nav>

    <!-- 下方的三栏网格架构 -->
    <div class="wrapper-layout">
      <!-- 左侧：极致缩减的精致侧栏 -->
      <header class="left-panel">
        <div class="sticky-box">
          <!-- 独立先锋 Logo 区域 -->
          <div class="brand-wrapper">
            <h1 class="logo-new">M H T</h1>
            <div class="logo-accent-line"></div>
          </div>
          <p class="subtitle-new">ARCHIVE // INDEX</p>
        </div>
      </header>

      <!-- 中间分割立线 -->
      <div class="vertical-divider"></div>

      <!-- 右侧：黄金大内容区 -->
      <main class="right-panel">
        <div v-if="loading" class="loading">Loading...</div>
        <div v-else-if="!list || list.length === 0" class="empty">Void.</div>
        
        <template v-else>
          <!-- 序号完美回归 #1, #2 虚拟自增 -->
          <article 
            v-for="(item, index) in list" 
            :key="item.id" 
            class="post-item"
            @click="$router.push(`/blog/${item.id}`)"
          >
            <div class="post-meta">
              <span class="post-id">#{{ index + 1 }}</span>
            </div>
            <h2 class="post-title">{{ item.title }}</h2>
            <div class="post-arrow">→</div>
          </article>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useBlogStore } from '../stores/blog'

const blogStore = useBlogStore()
const list = ref([])
const loading = ref(true)

// 4秒自动熔断恢复
watch(() => blogStore.globalError, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      blogStore.clearError()
    }, 4000)
  }
})

onMounted(async () => {
  try {
    // 拦截器清洗后，这里拿到的就是干干净净的后端真实 List 数组了
    list.value = await blogStore.fetchList()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 首页顶层控制线 */
.top-control-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 50px;
}
.site-status {
  display: flex;
  align-items: center;
  font-family: monospace;
  font-size: 0.8rem;
  color: #888;
}
.status-dot {
  width: 5px; height: 5px; background: #00aa55; border-radius: 50%; margin-right: 8px;
}
.status-dot-err {
  width: 5px; height: 5px; background: #ff3b30; border-radius: 50%; margin-right: 8px;
}
.status-text-err {
  color: #ff3b30;
  letter-spacing: 0.5px;
  font-weight: 500;
  animation: pulse-text 1.5s infinite;
}
@keyframes pulse-text {
  0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; }
}

.btn-write-nav {
  color: #111; text-decoration: none; font-family: monospace; font-size: 0.9rem; transition: opacity 0.2s;
}
.btn-write-nav:hover { opacity: 0.6; }

/* 网格架构 */
.wrapper-layout {
  display: grid;
  grid-template-columns: 220px 1px 1fr; 
  gap: 50px;
}
.left-panel .sticky-box {
  position: sticky;
  top: 50px;
}

/* 独立厂牌 Logo 视觉区 */
.brand-wrapper {
  display: inline-block;
  margin-bottom: 16px;
}
.logo-new {
  font-family: monospace, -apple-system, sans-serif;
  font-size: 2.4rem; 
  font-weight: 300;  
  letter-spacing: 12px; 
  line-height: 1;
  color: #111;
  text-transform: uppercase;
}
.logo-accent-line {
  width: 40px; height: 1px; background-color: #111; margin-top: 14px;
}
.subtitle-new {
  font-family: monospace; color: #999; font-size: 0.75rem; letter-spacing: 2px;
}

/* 中间竖线 */
.vertical-divider {
  background-color: #eee;
  height: calc(100vh - 170px); 
  position: sticky;
  top: 50px;
}

/* 右侧内容区 */
.right-panel { display: flex; flex-direction: column; }
.post-item {
  display: flex; align-items: center; padding: 35px 0; border-bottom: 1px solid #eee; cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.post-item:first-child { padding-top: 0; }
.post-item:hover { border-color: #111; }
.post-item:hover .post-title { transform: translateX(25px); color: #111; }
.post-item:hover .post-arrow { opacity: 1; transform: translateX(0); }
.post-meta { width: 90px; font-family: monospace; color: #bbb; }

.post-title {
  flex: 1; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 1.6rem; font-weight: 400; color: #333; transition: transform 0.4s ease, color 0.4s ease;
}
.post-arrow {
  opacity: 0; color: #111; transform: translateX(-15px); transition: all 0.4s ease; font-size: 1.5rem;
}
.loading, .empty { font-family: monospace; color: #999; }

@media (max-width: 992px) {
  .wrapper-layout { grid-template-columns: 1fr; gap: 40px; }
  .vertical-divider { display: none; }
  .left-panel .sticky-box { position: static; }
  .post-item:first-child { padding-top: 35px; }
}
</style>
