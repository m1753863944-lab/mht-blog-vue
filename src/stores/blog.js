import { defineStore } from 'pinia'
import axios from 'axios'


const isProd = import.meta.env.PROD;
const apiBaseURL = isProd 
  ? 'https://mht-blog-service.onrender.com/api/' 
  : 'http://localhost:8080/api/';

  
const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000
});

export const useBlogStore = defineStore('blog', {
  state: () => ({
    globalError: null 
  }),
  actions: {
    setError(msg) {
      this.globalError = msg
    },
    clearError() {
      this.globalError = null
    },

    // 🚀 原有 6 大接口保持纯净
    async fetchList() { return await api.get('/blog/list') },
    async fetchDetail(id) { return await api.get(`/blog/${id}`) },
    async fetchViews(id) { return await api.get(`/blog/${id}/views`) },
    async createPost(post) { return await api.post('/blog/create', post) },
    async updatePost(post) { return await api.put('/blog/update', post) },
    async deletePost(id) { return await api.delete(`/blog/delete/${id}`) },

    // 🔥 新增接口：周刊订阅 API (对应后端 /api/newsletter/subscribe)
    async subscribeNewsletter(email) {
      return await api.post('/newsletter/subscribe', { email })
    },

        // 🚀 新增业务接口：获取指定文章的真实留言列表（对应 GET /api/blog/{id}/comments）
    async fetchComments(postId) {
      return await api.get(`/blog/${postId}/comments`)
    },

    // 🚀 新增业务接口：向后端提交留言（对应 POST /api/blog/{id}/comments）
    async submitComment(postId, commentData) {
      return await api.post(`/blog/${postId}/comments`, commentData)
    },
    // 1. 首页直调：获取激活展示的卡片配置
    async fetchCardConfigs() {
      return await api.get('/blog/cards/config')
    },

    // 2. 🚀 修复报错：后台直调，拉取卡片池【全部】记录
    // 路径对齐您的规范：GET /api/blog/cards/all
    async fetchAllCardConfigs() {
      return await api.get('/blog/cards/all')
    },

    // 3. 🚀 精准按需更新接口
    // 路径对齐您的规范：POST /api/blog/cards/update-selective
    async updateCardConfigsSelective(dirtyConfigsList) {
      return await api.post('/blog/cards/update-selective', dirtyConfigsList)
    }
  }
})

// 全局响应拦截器保持原样
api.interceptors.response.use(
  response => {
    const res = response.data
    if (res && res.code !== 200) {
      const store = useBlogStore()
      store.setError(res.message || 'OPERATION_FAILED')
      return Promise.reject(new Error(res.message))
    }
    return res.data 
  },
  error => {
    const store = useBlogStore()
    store.setError('NETWORK_OR_SERVER_EXCEPTION // NET_ERR')
    return Promise.reject(error)
  }
)
