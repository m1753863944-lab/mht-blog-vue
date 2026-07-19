<template>
  <div class="animate-fade-in" v-if="post">
    <!-- 详情页精致顶部控制条 -->
    <nav class="detail-nav">
      <button @click="$router.push('/')" class="btn-ali-back">← Back to Insights</button>
      <div class="detail-actions">
        <button @click="$router.push(`/edit/${post.id}`)" class="btn-link-action">Edit</button>
        <button @click="showConfirm = true" class="btn-link-action danger">Delete</button>
      </div>
    </nav>

    <!-- 沉浸式杂志正文区 -->
    <main class="ali-article-container">
      <header class="article-header">
        <div class="article-meta">Published in <span>Tech & Systems</span> // {{ liveViews }} Readers</div>
        <h1 class="article-title">{{ post.title }}</h1>
        <div class="live-pulse-badge" @click="refreshViews">
          <span class="dot"></span>Live tracking active
        </div>
      </header>

      <!-- 核心：Georgia 优质阅读衬线体正文 -->
      <div class="ali-markdown-body" v-html="markdownContent"></div>

      <!-- ==========================================================================
         💬 真实后端联调：杂志书卷风每篇独立留言板模块
         ========================================================================== */ -->
      <section class="ali-comment-section">
        <h2 class="comment-heading">Discussion ({{ comments.length }})</h2>
        
        <!-- 提交新留言表单 -->
        <form @submit.prevent="handleCommentSubmit" class="comment-form">
          <div class="form-row">
            <input v-model="commentForm.author" type="text" placeholder="Your name" required />
          </div>
          <div class="form-row">
            <textarea v-model="commentForm.text" placeholder="Join the discussion, share your thoughts..." required></textarea>
          </div>
          <button type="submit" class="btn-submit-comment" :disabled="submittingComment">
            {{ submittingComment ? 'Posting...' : 'Post Comment' }}
          </button>
        </form>

        <!-- 真实留言展示列表 -->
        <div class="comments-list">
          <div v-if="comments.length === 0" class="empty-comments">No comments yet. Be the first to share!</div>
          <div v-else v-for="c in comments" :key="c.id" class="comment-item">
            <div class="comment-meta">
              <span class="comment-author">{{ c.author }}</span>
              <span class="comment-date">{{ c.createTime ? new Date(c.createTime).toLocaleString() : 'Just now' }}</span>
            </div>
            <p class="comment-content">{{ c.text }}</p>
          </div>
        </div>
      </section>
    </main>

    <!-- 确认删除弹窗 -->
    <Transition name="fade">
      <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
        <div class="modal-card">
          <p class="modal-text">Remove this article permanently?</p>
          <div class="modal-buttons">
            <button @click="showConfirm = false" class="btn-cancel">Cancel</button>
            <button @click="handleDelete" class="btn-confirm">Confirm Delete</button>
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

// 真实后端联调状态管理
const comments = ref([]) 
const submittingComment = ref(false)
const commentForm = ref({ author: '', text: '' })

// 4秒自动清除全局拦截器错误
watch(() => blogStore.globalError, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      blogStore.clearError()
    }, 4000)
  }
})

// 解析文章 Markdown 
const markdownContent = computed(() => {
  if (!post.value || !post.value.content) return ''
  return marked.parse(post.value.content, { breaks: true, gfm: true })
})

// 刷新实时浏览量
const refreshViews = async () => {
  try {
    liveViews.value = await blogStore.fetchViews(route.params.id)
  } catch (error) {
    console.error(error)
  }
}

// 真实调用 Store 从 Java 后端拉取最新留言数据
const loadComments = async () => {
  try {
    const id = route.params.id
    comments.value = await blogStore.fetchComments(id) 
  } catch (error) {
    console.error('加载留言失败:', error)
  }
}

// 处理真实的留言提交逻辑
const handleCommentSubmit = async () => {
  if (!commentForm.value.author.trim() || !commentForm.value.text.trim()) return
  submittingComment.value = true
  
  try {
    const id = route.params.id
    await blogStore.submitComment(id, {
      author: commentForm.value.author,
      text: commentForm.value.text
    })
    
    await loadComments() // 提交成功后重新拉取
    commentForm.value.author = ''
    commentForm.value.text = ''
  } catch (error) {
    console.error('提交留言失败:', error)
  } finally {
    submittingComment.value = false
  }
}

onMounted(async () => {
  const id = route.params.id
  post.value = await blogStore.fetchDetail(id)
  await Promise.all([
    refreshViews(),
    loadComments()
  ])
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

<!-- 🚀 样式分离：利用 src 指向同目录下的 BlogDetail.css -->
<style scoped src="./BlogDetail.css"></style>
