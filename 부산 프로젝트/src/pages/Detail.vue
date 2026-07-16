<template>
  <section class="detail-page">
    <div class="inner">
      <button class="back" @click="goBack">← 뒤로</button>
        <h1>{{ title }}</h1>
        <div v-if="item">
          <img v-if="item.firstimage || item.image" :src="item.firstimage || item.image" :alt="item.title || item.name" style="max-width:100%;border-radius:12px;margin:10px 0" />
          <p v-if="item.addr1"><strong>주소:</strong> {{ item.addr1 }}</p>
          <p v-if="item.where"><strong>위치:</strong> {{ item.where }}</p>
          <p v-if="item.tel"><strong>전화:</strong> {{ item.tel }}</p>
          <p v-if="item.description">{{ item.description }}</p>
          <p v-else-if="item.overview">{{ item.overview }}</p>
          <p v-else>상세 정보가 없습니다.</p>
          <p style="margin-top:12px;font-size:13px;color:var(--text-secondary)"><strong>데이터 소스:</strong> {{ source }}</p>
        </div>
        <p v-else>상세 정보를 불러올 수 없습니다. 목록에서 항목을 선택해 주세요.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const slug = route.params.slug || ''
function decodeSlug(s){
  return decodeURIComponent(s).replace(/-/g, ' ')
}

const title = computed(()=> decodeSlug(slug))

const item = ref(null)
const source = ref('')

async function findInFile(path){
  try{
    const res = await fetch(path)
    const data = await res.json()
    // normalize arrays
    const arr = Array.isArray(data) ? data : (data.items || data)
    if(!Array.isArray(arr)) return null
    const found = arr.find(it => {
      const t = it.title || it.name || it.id || ''
      return t && (t === title.value || t === decodeURIComponent(slug))
    })
    return found || null
  }catch(e){ return null }
}

onMounted(async ()=>{
  const files = [
    '/docs/data/부산_관광지.json',
    '/docs/data/부산_레포츠.json',
    '/docs/data/부산_축제공연행사.json',
    '/docs/data/events.json',
    '/docs/data/pois.json'
  ]
  for(const f of files){
    const found = await findInFile(f)
    if(found){ item.value = found; source.value = f; break }
  }
})

function goBack(){ router.back() }
</script>

<style scoped>
.inner{max-width:900px;margin:40px auto;padding:0 24px}
.back{border:0;background:#fff;padding:8px 12px;border-radius:8px;margin-bottom:18px}
h1{font-size:28px;margin:8px 0}
</style>
