<template>
  <div class="container animate-fade-in">
    <!-- 顶层宽幕控制线 -->
    <nav class="wide-nav">
      <button @click="$router.push('/')" class="btn-back">← Back Index</button>
      <button 
        @click="handleSave" 
        class="btn-save" 
        :disabled="submitting"
      >
        {{ submitting ? 'Saving...' : 'Save Changes' }}
      </button>
    </nav>

    <!-- 沉浸式管理表单大画幅区 -->
    <main class="config-body">
      <h1 class="page-title">Bento Cards Manager</h1>
      <p class="page-subtitle">Manage your project pool and toggle the iOS switches to show them on your homepage grid.</p>

      <div class="cards-form-list">
        <!-- 循环遍历数据库中拿到的所有卡片资产池 -->
        <div v-for="item in configs" :key="item.id" class="config-card-item">
          <div class="card-item-header">
            <span class="card-num-badge">PROJECT ID #{{ item.id }}</span>
            
            <!-- 🚀 核心：苹果质感的左右滑动状态小按钮 (iOS Toggle Switch) -->
            <div class="switch-wrapper">
              <span class="switch-label">{{ item.status === 1 ? 'Displaying' : 'Hidden' }}</span>
              <label class="ios-switch">
                <!-- 绑定卡片的真实状态，1 为开，0 为关 -->
                <input 
                  type="checkbox" 
                  :checked="item.status === 1" 
                  @change="item.status = ($event.target.checked ? 1 : 0)"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <input v-model="item.title" type="text" placeholder="Card Title" class="field-title" />
          </div>
          
          <div class="form-group">
            <textarea v-model="item.description" placeholder="Card short description..." class="field-desc"></textarea>
          </div>

          <div class="form-group url-group">
            <span class="url-prefix">https://</span>
            <input v-model="item.targetUrl" type="text" placeholder="://github.com" class="field-url" />
          </div>

          <!-- 位置分配器：如果状态开启了，可以指定它去首页的 1-5 号位置哪个格子 -->
          <div class="form-group position-select-group" v-if="item.status === 1">
            <label>Homepage Grid Position:</label>
            <select v-model="item.cardIndex" class="field-select">
              <option :value="0">Temporary Pool (Not in Grid)</option>
              <option :value="1">Position 1 (Left Orange Long Card)</option>
              <option :value="2">Position 2 (Top Right Cream Card)</option>
              <option :value="3">Position 3 (Middle Right Money Bag)</option>
              <option :value="4">Position 4 (Bottom Left Exam Paper)</option>
              <option :value="5">Position 5 (Bottom Right More Card)</option>
            </select>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBlogStore } from '../stores/blog'

const router = useRouter()
const blogStore = useBlogStore()

const configs = ref([])
const submitting = ref(false)

// 🚀 核心：用来存放刚进入页面时数据的“原始快照”，用于比对哪些卡片被修改了
let originalSnapshot = ""

onMounted(async () => {
  try {
    // 载入所有的卡片池数据
    const data = await blogStore.fetchAllCardConfigs() // 对应后端的查询全部卡片接口
    configs.value = data
    // 🚀 拍照留存：在用户没有动手修改前，通过 JSON 序列化将其深度克隆一份做为标尺
    originalSnapshot = JSON.stringify(data)
  } catch (error) {
    console.error(error)
  }
})

const handleSave = async () => {
  submitting.value = true
  
  try {
    // 🚀 黄金级脏检查（Dirty Check）算法：通过比对原始快照，精准剥离出有改动的数据
    const originalArray = JSON.parse(originalSnapshot)
    const dirtyConfigs = configs.value.filter(currentCard => {
      // 在原始快照中抓出对应 ID 的旧卡片进行字段像素级对撞
      const oldCard = originalArray.find(o => o.id === currentCard.id)
      if (!oldCard) return true // 新卡片
      
      // 比对标题、描述、跳转网址、展示位置、开启状态。只要有一个变了，就是“脏数据”
      return currentCard.title !== oldCard.title ||
             currentCard.description !== oldCard.description ||
             currentCard.targetUrl !== oldCard.targetUrl ||
             currentCard.cardIndex !== oldCard.cardIndex ||
             currentCard.status !== oldCard.status
    })

    console.log("精准筛选出的脏数据集合（只更新它们）:", dirtyConfigs)

    // 发送给追加好新接口的 Pinia，再传回 Java
    await blogStore.updateCardConfigsSelective(dirtyConfigs)
    router.push('/')
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 保持原有精致宽幕导航与大画幅打字区 */
.wide-nav { display: flex; justify-content: space-between; border-bottom: 1px solid #ede8da; padding-bottom: 20px; margin-bottom: 50px; }
.btn-back { background: none; border: none; color: #78716c; font-family: monospace; cursor: pointer; font-size: 0.95rem; font-weight: 600; }
.btn-back:hover { color: #1c1917; }
.btn-save { background: #1c1917; color: #ffffff; border: 1px solid #1c1917; padding: 10px 28px; font-weight: 600; font-size: 0.9rem; border-radius: 30px; cursor: pointer; transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.btn-save:hover:not(:disabled) { background: #ff9e79; border-color: #ff9e79; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(255, 158, 121, 0.3); }

.config-body { max-width: 760px; margin: 0 auto; }
.page-title { font-family: Georgia, serif; font-size: 2.2rem; font-weight: 800; color: #1c1917; margin-bottom: 8px; }
.page-subtitle { color: #78716c; font-size: 0.95rem; margin-bottom: 40px; }
.cards-form-list { display: flex; flex-direction: column; gap: 40px; }
.config-card-item { background: #fdfbf7; border: 1px dashed #d6d1c2; padding: 30px; border-radius: 12px; display: flex; flex-direction: column; gap: 16px; }
.card-item-header { display: flex; justify-content: space-between; align-items: center; font-family: monospace; font-size: 0.75rem; color: #a8a29e; border-bottom: 1px solid #ede8da; padding-bottom: 12px; margin-bottom: 8px;}
.card-num-badge { font-weight: 700; color: #2563eb; }

.field-title { background: none; border: none; font-family: Georgia, serif; font-size: 1.5rem; font-weight: 700; color: #1c1917; outline: none; width: 100%; }
.field-desc { background: none; border: none; font-size: 0.98rem; color: #57534e; line-height: 1.6; outline: none; width: 100%; resize: vertical; min-height: 50px; }
.url-group { display: flex; align-items: center; background: #fff; border: 1px solid #d6d1c2; border-radius: 6px; padding: 10px 14px; }
.url-prefix { font-family: monospace; font-size: 0.9rem; color: #a8a29e; padding-right: 4px; }
.field-url { background: none; border: none; outline: none; font-family: monospace; font-size: 0.9rem; color: #2563eb; flex: 1; }

.position-select-group { display: flex; align-items: center; gap: 12px; margin-top: 10px; font-size: 0.9rem; color: #57534e; }
.field-select { padding: 8px 12px; border-radius: 6px; border: 1px solid #d6d1c2; background: #fff; outline: none; font-family: inherit; color: #1c1917; }

/* ==========================================================================
   🍏 像素级纯 CSS 打造：高级 iOS 左右平滑变色滑块开关
   ========================================================================== */
.switch-wrapper { display: flex; align-items: center; gap: 10px; }
.switch-label { font-size: 0.8rem; font-weight: 600; font-family: monospace; text-transform: uppercase; color: #78716c;}

.ios-switch {
  position: relative; display: inline-block; width: 44px; height: 24px;
}
.ios-switch input { opacity: 0; width: 0; height: 0; }

.slider {
  position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
  background-color: #e2e0d5; /* 关闭状态：温润的纸质灰色 */
  transition: .3s cubic-bezier(0.16, 1, 0.3, 1); border-radius: 34px;
}
.slider:before {
  position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
  background-color: white; border-radius: 50%;
  transition: .3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* 🚀 激活开状态：平滑滑动并晕染出 Ali 经典的活力珊瑚橙色 */
input:checked + .slider { background-color: #ff9e79; }
input:checked + .slider:before { transform: translateX(20px); }
</style>
