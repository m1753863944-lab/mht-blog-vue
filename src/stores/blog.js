import { defineStore } from 'pinia'
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://mht-blog-service.onrender.com/api', 
  timeout: 10000
})

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

    // 6 大业务接口直调
    async fetchList() {
      return await api.get('/blog/list')
    },
    async fetchDetail(id) {
      return await api.get(`/blog/${id}`)
    },
    async fetchViews(id) {
      return await api.get(`/blog/${id}/views`)
    },
    async createPost(post) {
      return await api.post('/blog/create', post)
    },
    async updatePost(post) {
      return await api.put('/blog/update', post)
    },
    async deletePost(id) {
      return await api.delete(`/blog/delete/${id}`)
    }
  }
})

// 全局响应拦截器：精准剥离统一响应体，解决属性误渲染问题
api.interceptors.response.use(
  response => {
    const res = response.data
    
    // 1. 如果后端明确返回了错误状态码
    if (res && res.code !== 200) {
      const store = useBlogStore()
      store.setError(res.message || 'OPERATION_FAILED')
      return Promise.reject(new Error(res.message))
    }
    
    // 2. 🔥 核心修正：返回真正清洗后的业务数据（即 res.data 里面的文章数组或详情）
    return res.data 
  },
  error => {
    const store = useBlogStore()
    store.setError('NETWORK_OR_SERVER_EXCEPTION // NET_ERR')
    return Promise.reject(error)
  }
)
