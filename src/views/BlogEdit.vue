<template>
  <div class="animate-fade-in">
    <!-- 顶天立地、横向拉满的宽幕控制线 -->
    <nav class="wide-nav">
      <button @click="$router.back()" class="btn-back">← Cancel</button>
      
      <!-- 绑定 :disabled 属性，当校验不通过或正在提交时置灰 -->
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

// 核心逻辑：利用计算属性实时校验输入内容
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

<!-- 🚀 样式分离：利用 src 指向同目录下的 BlogEdit.css -->
<style scoped src="./BlogEdit.css"></style>
