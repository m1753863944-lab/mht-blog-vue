<template>
  <div class="animate-fade-in">
    <!-- 极简古典导航头 -->
    <header class="ali-header">
      <div class="brand-logo" @click="$router.push('/')">MHT // ARCHIVE</div>
      <nav class="header-links">
        <router-link to="/write" class="nav-accent-btn">Write Article</router-link>
      </nav>
    </header>

    <!-- 主两栏网格比例 -->
    <div class="ali-grid-layout">
      
      <!-- 左栏：个人 IP 精华区 + 高转化订阅器 -->
      <aside class="ali-profile-sidebar">
        <div class="sticky-box">
          <h1 class="profile-name">Hey, I'm MHT. 👋</h1>
          <p class="profile-bio">
            I’m a software engineer and creator. Here, I write about tech stacks, productivity systems, and business ideas that help me live a more deliberate and fulfilling life.
          </p>
          
          <!-- Newsletter 订阅框 -->
          <div class="ali-newsletter-card">
            <span class="news-badge">SUNDAY SNIPPETS</span>
            <h3 class="news-title">Join 500k+ Readers</h3>
            <p class="news-subtitle">Every Sunday I share actionable productivity tips and life lessons directly to your inbox.</p>
            
            <form @submit.prevent="handleSubscribe" class="news-form">
              <input v-model="email" type="email" placeholder="Enter your email address" required :disabled="subscribing"/>
              <button type="submit" :disabled="subscribing">{{ subscribing ? 'Joining...' : 'Get the Snippets' }}</button>
            </form>
            <p v-if="subscribeSuccess" class="news-success">✓ You're in! Check your email shortly.</p>
          </div>
        </div>
      </aside>

      <!-- 右栏：黄金双列高质感特色看板（🚀 升级为：纯数据库配置驱动外链版） -->
      <main class="ali-articles-flow">
        
        <!-- 矩阵容器：通过 align-items: start 锁死非对称落差机制 -->
        <section class="ali-offerings-grid" v-if="cards.length >= 5">
          
          <!-- 1. 🔥 标志性珊瑚橙色卡片（绑定第 1 个配置，点击跳转外部 targetUrl） -->
          <div class="offering-card color-orange card-span-two-rows" @click="goToLink(getCard(1).targetUrl)">
            <div class="icon-wrapper">
              <div class="macbook-icon">
                <div class="screen"><span class="play-btn">▲</span></div>
                <div class="base"></div>
              </div>
            </div>
            <div class="offering-content">
              <h2 class="offering-title">{{ getCard(1).title }}</h2>
              <p class="offering-desc">{{ getCard(1).description }}</p>
              <div class="offering-link">Get started <span class="arrow">→</span></div>
            </div>
          </div>

          <!-- 2. 右上角卡片（绑定第 2 个配置） -->
          <div class="offering-card color-cream" @click="goToLink(getCard(2).targetUrl)">
            <div class="offering-content">
              <h2 class="offering-title">{{ getCard(2).title }}</h2>
              <p class="offering-desc">{{ getCard(2).description }}</p>
              <div class="offering-link">Get started <span class="arrow">→</span></div>
            </div>
          </div>

          <!-- 3. 右中钱袋子卡片（绑定第 3 个配置） -->
          <div class="offering-card color-cream" @click="goToLink(getCard(3).targetUrl)">
            <div class="icon-wrapper">
              <div class="money-bag">
                <span class="bag-tie"></span>
                <span class="dollar-sign">$</span>
              </div>
            </div>
            <div class="offering-content">
              <h2 class="offering-title">{{ getCard(3).title }}</h2>
              <p class="offering-desc">{{ getCard(3).description }}</p>
              <div class="offering-link">Get started <span class="arrow">→</span></div>
            </div>
          </div>

          <!-- 4. 左下角考试提分卡片（绑定第 4 个配置） -->
          <div class="offering-card color-cream" @click="goToLink(getCard(4).targetUrl)">
            <div class="icon-wrapper">
              <div class="exam-paper">
                <div class="paper-line"></div>
                <div class="paper-line short"></div>
                <div class="paper-badge"></div>
              </div>
            </div>
            <div class="offering-content">
              <h2 class="offering-title">{{ getCard(4).title }}</h2>
              <p class="offering-desc">{{ getCard(4).description }}</p>
              <div class="offering-link">Get started <span class="arrow">→</span></div>
            </div>
          </div>

          <!-- 5. 右下角探索更多卡片（绑定第 5 个配置） -->
          <div class="offering-card color-cream footer-more-card" @click="goToLink(getCard(5).targetUrl)">
            <div class="offering-content">
              <h2 class="offering-title">{{ getCard(5).title }}</h2>
              <div class="offering-link">{{ getCard(5).description }} <span class="arrow">→</span></div>
            </div>
          </div>

        </section>

        <!-- 下方干净真实的后端文章流（保持不动） -->
        <div class="flow-header" style="margin-top: 60px;">
          <h2 class="flow-title">Recent Musings</h2>
        </div>
        <div v-if="loading" class="ali-loading">Loading archives...</div>
        <div v-else class="simple-posts-list">
          <div v-for="item in list" :key="item.id" class="simple-post-row" @click="$router.push(`/blog/${item.id}`)">
            <h3 class="simple-row-title">{{ item.title }}</h3>
            <span class="simple-row-arrow">→</span>
          </div>
        </div>

      </main>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBlogStore } from '../stores/blog'

const blogStore = useBlogStore()
const list = ref([])
const cards = ref([]) // 🚀 核心：存放来自后端的 5 条卡片配置数据
const loading = ref(true)

const email = ref('')
const subscribing = ref(false)
const subscribeSuccess = ref(false)

// 安全防御函数：通过位置索引（1-5）精准且稳健地提取卡片对象
const getCard = (index) => {
  return cards.value.find(c => c.cardIndex === index) || { title: '', description: '', targetUrl: '' }
}

// 🚀 核心动效：点击卡片时，触发高智感的新标签页外链跳转
const goToLink = (url) => {
  if (url) {
    window.open(url, '_blank')
  }
}

onMounted(async () => {
  try { 
    // 异步并行：同时去加载文章列表和卡片的全局配置
    const [postsData, configsData] = await Promise.all([
      blogStore.fetchList(),
      blogStore.fetchCardConfigs()
    ])
    list.value = postsData
    cards.value = configsData
  } catch (error) { 
    console.error(error) 
  } finally { 
    loading.value = false 
  }
})

const handleSubscribe = async () => {
  if (!email.value) return
  subscribing.value = true
  try {
    await blogStore.subscribeNewsletter(email.value)
    subscribeSuccess.value = true
    email.value = ''
  } catch (error) { 
    console.error(error) 
  } finally { 
    subscribing.value = false 
  }
}
</script>

<style scoped src="./BlogList.css"></style>
