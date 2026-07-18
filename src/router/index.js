import { createRouter, createWebHistory } from 'vue-router'
import BlogList from '../views/BlogList.vue'
import BlogDetail from '../views/BlogDetail.vue'
import BlogEdit from '../views/BlogEdit.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: BlogList },
    { path: '/blog/:id', component: BlogDetail },
    { path: '/write', component: BlogEdit },
    { path: '/edit/:id', component: BlogEdit }
  ]
})

export default router
