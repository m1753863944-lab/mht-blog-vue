<template>
  <div class="container animate-fade-in" v-if="post">
    <!-- 紧凑型宽幕导航线 -->
    <nav class="wide-nav">
      <div class="nav-left-group">
        <button @click="$router.push('/')" class="btn-back">← Index</button>
        <!-- 🔥 详情页无感状态轴 -->
        <span v-if="blogStore.globalError" class="detail-error-text">
          // ERROR: {{ blogStore.globalError }}
        </span>
      </div>
      <div class="actions">
        <button @click="$router.push(`/edit/${post.id}`)" class="btn-action">Edit</button>
        <button @click="showConfirm = true" class="btn-action danger">Delete</button>
      </div>
    </nav>

    <!-- 正文区 -->
    <main class="article-body">
      <h1 class="title">{{ post.title }}</h1>
      
      <div class="live-counter" @click="refreshViews" title="点击刷新实时浏览量">
        <span class="pulse-dot"></span>
        <span class="views-count">{{ liveViews }} Views</span>
      </div>

      <div class="content markdown-body" v-html="markdownContent"></div>
    </main>

    <!-- 确认弹窗 -->
    <Transition name="fade">
      <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
        <div class="modal-card">
          <p class="modal-text">Delete permanently?</p>
          <div class="modal-buttons">
            <button @click="showConfirm = false" class="btn-modal-cancel">Cancel</button>
            <button @click="handleDelete" class="btn-modal-confirm">Confirm</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '../stores/blog'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

const post = ref(null)
const liveViews = ref(0)
let timer = null
const showConfirm = ref(false)

// 4秒自动清除错误
watch(() => blogStore.globalError, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      blogStore.clearError()
    }, 4000)
  }
})

const markdownContent = computed(() => {
  if (!post.value || !post.value.content) return ''
  return marked.parse(post.value.content, { breaks: true, gfm: true })
})

const refreshViews = async () => {
  try {
    liveViews.value = await blogStore.fetchViews(route.params.id)
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  const id = route.params.id
  post.value = await blogStore.fetchDetail(id)
  await refreshViews()
  timer = setInterval(refreshViews, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const handleDelete = async () => {
  showConfirm.value = false
  await blogStore.deletePost(post.value.id)
  router.push('/')
}
</script>

<style scoped>
.wide-nav {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 50px;
}
.nav-left-group {
  display: flex;
  align-items: center;
  gap: 20px;
}
/* 🔥 详情页专属极细灰色错误流动行 */
.detail-error-text {
  font-family: monospace;
  font-size: 0.8rem;
  color: #999;
  letter-spacing: 0.5px;
  animation: pulse-text 1.5s infinite;
}
@keyframes pulse-text {
  0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; }
}

.btn-back, .btn-action {
  background: none; border: none; color: #666; font-family: monospace; cursor: pointer; font-size: 0.95rem;
}
.btn-back:hover, .btn-action:hover { color: #111; }
.actions .btn-action { margin-left: 40px; }
.actions .danger:hover { color: #ff3b30; }

.article-body { max-width: 850px; margin: 0 auto; }
.title { font-size: 2.8rem; font-weight: 400; letter-spacing: -0.5px; line-height: 1.3; margin-bottom: 20px; color: #111; }
.live-counter { display: inline-flex; align-items: center; background: #f0f0f0; padding: 6px 14px; border-radius: 20px; font-family: monospace; font-size: 0.8rem; color: #00aa55; margin-bottom: 40px; }
.pulse-dot { width: 6px; height: 6px; background: #00aa55; border-radius: 50%; margin-right: 8px; box-shadow: 0 0 8px #00aa55; animation: pulse 2s infinite; }

/* Markdown 样式 */
.markdown-body { font-size: 1.15rem; line-height: 2; color: #222; }
:deep(.markdown-body p) { margin-bottom: 25px; }
:deep(.markdown-body h1), :deep(.markdown-body h2), :deep(.markdown-body h3) { color: #111; font-weight: 500; margin-top: 40px; margin-bottom: 15px; line-height: 1.4; }
:deep(.markdown-body h2) { font-size: 1.6rem; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; }
:deep(.markdown-body h3) { font-size: 1.3rem; }
:deep(.markdown-body code) { font-family: monospace; background-color: #f5f5f5; padding: 3px 6px; border-radius: 4px; font-size: 0.95rem; color: #ff3b30; }
:deep(.markdown-body pre) { background: #fcfcfc; border: 1px solid #f0f0f0; padding: 20px; border-radius: 8px; overflow-x: auto; margin: 30px 0; }
:deep(.markdown-body pre code) { background: none; padding: 0; color: #333; font-size: 0.9rem; }
:deep(.markdown-body blockquote) { margin: 30px 0; padding-left: 20px; border-left: 3px solid #111; color: #666; font-style: italic; }
:deep(.markdown-body ul), :deep(.markdown-body ol) { padding-left: 24px; margin-bottom: 25px; }
:deep(.markdown-body li) { margin-bottom: 8px; }
:deep(.markdown-body a) { color: #111; text-decoration: none; border-bottom: 1px dashed #999; }
:deep(.markdown-body a:hover) { border-bottom-style: solid; }

/* 弹窗样式 */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal-card { background: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05); text-align: center; max-width: 360px; width: 90%; }
.modal-text { font-size: 1.1rem; color: #111; margin-bottom: 30px; }
.modal-buttons { display: flex; justify-content: center; gap: 30px; }
.btn-modal-cancel, .btn-modal-confirm { background: none; border: none; font-family: monospace; font-size: 0.9rem; cursor: pointer; }
.btn-modal-cancel { color: #888; }
.btn-modal-confirm { color: #ff3b30; font-weight: 600; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-from .modal-card { transform: translateY(15px); }
.fade-leave-to .modal-card { transform: translateY(-15px); }

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 170, 85, 0.4); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(0, 170, 85, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 170, 85, 0); }
}
</style>
