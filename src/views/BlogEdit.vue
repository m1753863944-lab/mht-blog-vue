<template>
  <div class="container animate-fade-in">
    <!-- 顶天立地、横向拉满的宽幕控制线 -->
    <nav class="wide-nav">
      <button @click="$router.back()" class="btn-back">← Cancel</button>
      
      <!-- 🔥 核心改动：绑定 :disabled 属性，当校验不通过时置灰 -->
      <button 
        @click="handlePublish" 
        class="btn-publish" 
        :disabled="isButtonDisabled"
      >
        {{ submitting ? 'Publishing...' : 'Publish' }}
      </button>
    </nav>

    <!-- 同样舒适优雅的无框大画幅打字区 -->
    <main class="editor-body">
      <input 
        v-model="form.title" 
        type="text" 
        placeholder="Title" 
        class="input-title"
        autofocus
      />
      <textarea 
        v-model="form.content" 
        placeholder="Tell your story..." 
        class="input-content"
      ></textarea>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore } from '../stores/blog'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

const isEdit = ref(false)
const submitting = ref(false)
const form = ref({
  title: '',
  content: ''
})

// 🔥 核心逻辑：利用计算属性实时校验输入内容
// 只有当“标题不为空”且“内容不为空”且“不在提交中”时，按钮才可用
const isButtonDisabled = computed(() => {
  const hasTitle = form.value.title && form.value.title.trim()
  const hasContent = form.value.content && form.value.content.trim()
  return !hasTitle || !hasContent || submitting.value
})

onMounted(async () => {
  if (route.params.id) {
    isEdit.value = true
    const data = await blogStore.fetchDetail(route.params.id)
    form.value = { id: data.id, title: data.title, content: data.content }
  }
})

const handlePublish = async () => {
  // 双重保险校验
  if (isButtonDisabled.value) return
  
  submitting.value = true
  try {
    if (isEdit.value) {
      await blogStore.updatePost(form.value)
      router.push(`/blog/${form.value.id}`)
    } else {
      await blogStore.createPost(form.value)
      router.push('/')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 与详情页完全对齐的紧凑宽幕导航 */
.wide-nav {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 50px;
}
.btn-back {
  background: none;
  border: none;
  color: #666;
  font-family: monospace;
  cursor: pointer;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}
.btn-back:hover {
  color: #111;
}

/* 按钮基础样式 */
.btn-publish {
  background: #111;
  color: #fff;
  border: none;
  padding: 8px 24px;
  font-weight: 500;
  font-family: monospace;
  font-size: 0.9rem;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-publish:hover {
  opacity: 0.85;
}

/* 🔥 核心样式：按钮被置灰（disabled）时的高级感视觉 */
.btn-publish:disabled {
  background: #f0f0f0;  /* 变成干净的浅灰色底 */
  color: #aaa;         /* 浅灰文字 */
  cursor: not-allowed; /* 鼠标悬浮时展示禁用图标 */
  opacity: 1;          /* 覆盖默认的半透明效果 */
}
.btn-publish:disabled:hover {
  opacity: 1;          /* 禁用时悬浮不再触发任何变亮或变暗的特效 */
}

/* 核心无框编辑区 */
.editor-body {
  max-width: 850px;
  margin: 0 auto;
}
.input-title {
  background: none;
  border: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 2.8rem;
  font-weight: 400;
  color: #111;
  margin-bottom: 30px;
  outline: none;
  width: 100%;
  letter-spacing: -0.5px;
}
.input-title::placeholder, .input-content::placeholder {
  color: #ccc;
}
.input-content {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #222;
  line-height: 2;
  outline: none;
  resize: none;
  min-height: 500px;
  width: 100%;
  font-family: inherit;
}
</style>
