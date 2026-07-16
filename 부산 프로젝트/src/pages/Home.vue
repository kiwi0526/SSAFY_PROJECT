<template>
  <section class="home-preview">
    <div class="utility"><div class="inner"><span>부산의 모든 여행 정보를 한곳에서</span><div class="utility-links"></div></div></div>
    <header class="header"><div class="inner">
      <div class="brand"><div class="mark"></div><div><strong>Local<span>Hub</span></strong><small>DISCOVER BUSAN</small></div></div>
      <nav class="nav"><a class="active" href="#home">홈</a><a href="#recommend">여행지</a><a href="#theme">테마여행</a><a href="#festival">축제·행사</a><a href="#community">여행 커뮤니티</a></nav>
      <div class="header-tools"></div>
    </div></header>

    <section class="hero" id="home" :style="heroStyle"><div class="sea-lines"></div><div class="inner">
      <div class="eyebrow">BUSAN TRAVEL CURATION</div>
      <h1>부산을 가장<br><em>부산답게</em> 여행하는 법</h1>
      <p>바다와 골목, 축제와 맛집까지. 지금의 부산을 발견하고 나만의 여행을 계획해 보세요.</p>
      <form class="search-box" @submit.prevent="onSearch">
        <input v-model="searchQuery" placeholder="어디로 떠나고 싶나요?" @input="updateSuggestions" />
        <button type="submit">여행지 검색</button>
      </form>
      <div class="suggestions" v-if="suggestions.length">
        <button v-for="s in suggestions" :key="s" @click="applySuggestion(s)">{{ s }}</button>
      </div>
      <div class="keywords"><span>추천 검색어</span><button @click="setKeyword('광안리')">광안리</button><button @click="setKeyword('해운대')">해운대</button><button @click="setKeyword('감천문화마을')">감천문화마을</button><button @click="setKeyword('부산축제')">부산축제</button></div>
      <div class="search-results" v-if="searchResults.length">
        <div class="results-head">검색 결과 <small>"{{ searchQuery }}"</small></div>
        <ul>
          <li v-for="r in searchResults" :key="r._id" class="result-item">
            <strong>{{ r.title }}</strong>
            <div class="result-meta">{{ r.type }} · {{ r.subtitle }}</div>
          </li>
        </ul>
      </div>
      <article v-if="heroTitle" class="hero-card" role="button" tabindex="0" @click="goToDetail(heroTitle)" style="cursor:pointer">
        <div class="visual">
          <img :src="heroImage" :alt="heroTitle" class="hero-img" />
        </div>
        <small>LOCAL PICK 01</small>
        <h3>{{ heroTitle }}</h3>
        <p>{{ heroDesc }}</p>
      </article>
      <article v-else class="hero-card">
        <div class="visual"><img src="" alt="" class="hero-img" /></div>
        <small>LOCAL PICK 01</small>
        <h3>로딩 중</h3>
        <p>데이터를 불러오는 중입니다.</p>
      </article>
    </div></section>

    <div class="quick-wrap" :class="{ 'search-open': searchResults.length }"><div class="quick">
      <button v-for="q in quicks" :key="q.label" @click="handleQuick(q)"><span class="circle">{{ q.icon }}</span>{{ q.label }}</button>
    </div></div>

    <section class="section" id="recommend"><div class="inner"><div class="section-head"><div><div class="section-label">RECOMMENDED PLACE</div><h2>지금 부산에서 꼭 가볼 곳</h2></div><button class="more" @click="goToMap">전체 보기 →</button></div>
      <div class="cards">
        <article v-for="c in travelCards" :key="c.title" class="travel-card" role="button" tabindex="0" @click="openInMaps(c)" style="cursor:pointer">
          <div :class="['thumb', c.thumb]">
            <img v-if="c.img" :src="c.img" alt="" class="thumb-img" />
            <div v-else class="thumb-placeholder"></div>
            <span class="badge">{{ c.tag }}</span>
            <button class="like">♡</button>
          </div>
          <div class="card-body"><h3>{{ c.title }}</h3><p>{{ c.desc }}</p><div class="meta"><span>{{ c.region }}</span><span>조회 {{ c.views }}</span></div></div>
        </article>
      </div>
    </div></section>

    <section class="section alt" id="theme"><div class="inner"><div class="section-head"><div><div class="section-label">THEME TRAVEL</div><h2>취향대로 즐기는 부산</h2></div><button class="more" @click="goToMapThemes">테마 더보기 →</button></div>
      <div class="theme-grid">
        <article v-for="(t,i) in themes" :key="t.title" class="theme" :style="{ backgroundImage: t.img ? `linear-gradient(rgba(0,0,0,0.32), rgba(0,0,0,0.18)), url(${t.img})` : '' }" role="button" tabindex="0" @click="openTheme(t)" style="cursor:pointer">
          <span class="num">{{ (i+1).toString().padStart(2,'0') }}</span>
          <h3>{{ t.title }}</h3>
          <p>{{ t.desc }}</p>
        </article>
      </div>
    </div></section>

    <section class="section" id="festival"><div class="inner"><div class="section-head"><div><div class="section-label">FESTIVAL & EVENT</div><h2>오늘 부산에서 만나는 즐거움</h2></div><button class="more" @click="goToCalendar">캘린더 보기 →</button></div>
      <div class="festival"><article class="festival-main" :style="festivalStyle"><span class="date">2026. 07. 18 — 08. 24</span><h3>부산 바다축제</h3><p>여름 바다를 배경으로 펼쳐지는 공연과 체험, 부산을 대표하는 계절 축제를 만나보세요.</p></article><div class="festival-list">
        <article v-for="e in events" :key="e.title" class="event"><div class="event-date"><span>{{ e.month }}</span><strong>{{ e.day }}</strong></div><div><h4>{{ e.title }}</h4><p>{{ e.where }} · {{ e.time }}</p></div><span class="arrow">›</span></article>
      </div></div>
    </div></section>

    <section class="section alt" id="community"><div class="inner"><div class="section-head"><div><div class="section-label">TRAVEL COMMUNITY</div><h2>여행자들의 부산 이야기</h2></div></div>
      <div class="community"><div class="post-list"><div class="panel-title"><h3>인기 여행 후기</h3><button class="more" @click="goToBoard">더보기</button></div><div v-for="p in posts" :key="p.title" class="post"><strong>{{ p.title }}</strong><span>{{ p.meta }}</span></div></div></div>
    </div></section>

    <footer class="footer"><div class="inner"><div><div class="footer-brand">LocalHub Busan</div><p>부산 여행정보와 지역 커뮤니티를 연결하는 로컬 여행 플랫폼<br>© 2026 LocalHub. All rights reserved.</p></div><div class="footer-links"><span>이용약관</span><span>개인정보처리방침</span><span>관광정보 수정요청</span></div></div></footer>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
const searchQuery = ref('')
const searchResults = ref([])
const suggestions = ref([])

function onSearch(){
  const qRaw = (searchQuery.value || '').trim()
  const q = qRaw.toLowerCase()
  console.log('[onSearch] query=', qRaw)
  if(!q){
    searchResults.value = []
    return
  }
  const results = []
  // search travelCards
  travelCards.forEach((c, i)=>{
    const hay = (c.title + ' ' + c.desc + ' ' + c.region + ' ' + c.tag).toLowerCase()
    if(hay.includes(q)) results.push({ _id: 'card-'+i, type: '여행지', title: c.title, subtitle: c.region })
  })
  // search events
  events.forEach((e,i)=>{
    const hay = (e.title + ' ' + e.where + ' ' + e.time).toLowerCase()
    if(hay.includes(q)) results.push({ _id: 'event-'+i, type: '행사', title: e.title, subtitle: e.where })
  })
  // search posts
  posts.forEach((p,i)=>{
    const hay = (p.title + ' ' + p.meta).toLowerCase()
    if(hay.includes(q)) results.push({ _id: 'post-'+i, type: '후기', title: p.title, subtitle: p.meta })
  })

  // dedupe by title
  const seen = new Set()
  searchResults.value = results.filter(r => {
    if(seen.has(r.title)) return false
    seen.add(r.title)
    return true
  })
  console.log('[onSearch] results=', searchResults.value)
}

function setKeyword(k){searchQuery.value=k;onSearch()}

function updateSuggestions(){
  const q = (searchQuery.value || '').trim().toLowerCase()
  if(!q){ suggestions.value = []; return }
  const pool = []
  travelCards.forEach(c=> pool.push(c.title))
  events.forEach(e=> pool.push(e.title))
  posts.forEach(p=> pool.push(p.title))
  const seen = new Set()
  suggestions.value = pool.filter(t=> t && t.toLowerCase().includes(q) )
    .filter(t=>{ if(seen.has(t)) return false; seen.add(t); return true }).slice(0,6)
}

function applySuggestion(s){ searchQuery.value = s; onSearch(); suggestions.value = [] }

const router = useRouter()
function goToMap(){
  router.push({ name: 'Map' })
}
function goToMapThemes(){
  router.push({ name: 'Map', query: { view: 'themes' } })
}
function goToCalendar(){
  router.push({ name: 'Calendar' })
}
function goToBoard(){
  router.push({ name: 'Board' })
}

function openTheme(theme){
  const q = theme && theme.title ? theme.title : ''
  // Map specific home themes to targeted map queries/categories
  const title = String(q || '')
  if(/바다/.test(title)){
    // sea travel -> search for '바다'
    router.push({ name: 'Map', query: { theme: '바다' } })
    return
  }
  if(/초록|산책|공원/.test(title)){
    // green travel -> search for '공원'
    router.push({ name: 'Map', query: { theme: '공원' } })
    return
  }
  if(/맛|맛집|맛있는/.test(title)){
    // food theme -> use text search for '맛집'
    router.push({ name: 'Map', query: { theme: '맛집' } })
    return
  }
  // fallback: pass the theme text through
  router.push({ name: 'Map', query: { theme: q } })
}
function slugify(s){
  return encodeURIComponent(String(s).trim().replace(/\s+/g,'-'))
}
function goToDetail(title){
  const slug = slugify(title)
  router.push({ name: 'Detail', params: { slug } })
}

function openInMaps(card){
  const lat = card.lat
  const lng = card.lng
  const q = encodeURIComponent(card.title || '')
  let url = ''
  // Use Kakao Map: if coords available use link/map (title,lat,lng), else fallback to search query
  if(!isNaN(lat) && !isNaN(lng)){
    const title = encodeURIComponent(card.title || '')
    url = `https://map.kakao.com/link/map/${title},${lat},${lng}`
  }else{
    url = `https://map.kakao.com/?q=${q}`
  }
  window.open(url, '_blank')
}

const quicks = [
  { icon: '🌊', label: '관광지', to: { name: 'Map', query: { category: '관광지' } } },
  { icon: '🏨', label: '숙박', to: { name: 'Map', query: { category: '숙박' } } },
  { icon: '🎨', label: '문화시설', to: { name: 'Map', query: { category: '문화시설' } } },
  { icon: '🎉', label: '축제·행사', to: { name: 'Calendar' } },
  { icon: '🚲', label: '레포츠', to: { name: 'Map', query: { category: '레포츠' } } },
  { icon: '🛍️', label: '쇼핑', to: { name: 'Map', query: { category: '쇼핑' } } },
  { icon: '🗺️', label: '여행코스', to: { name: 'Map', query: { category: '여행코스' } } },
]

function handleQuick(q){
  if(q && q.to){
    router.push(q.to)
  }
}

import tourData from "../../docs/data/부산_관광지.json"

// Titles to hide on the home preview (user request)
const hiddenHomeTitles = new Set([
  "주식회사 놀핏",
  "보수동 책방골목",
  "구상반려암 (부산 국가지질공원)",
])

// build travelCards from provided data (use firstimage when available)
const travelCards = (Array.isArray(tourData.items) ? tourData.items : [])
  .filter(i => i.title && !hiddenHomeTitles.has(i.title))
  .slice(0, 9)
  .map((i, idx) => ({
    thumb: ['one','two','three'][idx % 3] || 'one',
    tag: i.lclsSystm2 || i.cat1 || '관광지',
    title: i.title,
    desc: i.addr1 || i.addr2 || '',
    region: i.sigungucode || '',
    views: '',
    img: i.firstimage || i.firstimage2 || '',
    lat: i.mapy ? parseFloat(i.mapy) : (i.latitude ? parseFloat(i.latitude) : NaN),
    lng: i.mapx ? parseFloat(i.mapx) : (i.longitude ? parseFloat(i.longitude) : NaN),
  }))

  // If 구상반려암 were present, ensure it has a representative image; skipped if hidden
  travelCards.forEach(c=>{
    if(/구상반려암/.test(c.title) && !c.img){
      c.img = '/src/assets/gusangbanryeoram.jpg'
    }
  })

  // If a specific unwanted card appears (clinic), replace it with the next suitable item
  const unwantedTitle = '더바디성형외과의원'
  const unwantedIdx = travelCards.findIndex(c => c.title && c.title.includes(unwantedTitle))
  if(unwantedIdx !== -1){
    const pool = Array.isArray(tourData.items) ? tourData.items : []
    const existing = new Set(travelCards.map(c=>c.title))
    let replacement = null
    for(let i = 9; i < pool.length; i++){
      const it = pool[i]
      if(!it || !it.title) continue
      if(hiddenHomeTitles && hiddenHomeTitles.has && hiddenHomeTitles.has(it.title)) continue
      if(existing.has(it.title)) continue
      replacement = {
        thumb: ['one','two','three'][i % 3] || 'one',
        tag: it.lclsSystm2 || it.cat1 || '관광지',
        title: it.title,
        desc: it.addr1 || it.addr2 || '',
        region: it.sigungucode || '',
        views: '',
        img: it.firstimage || it.firstimage2 || '',
        lat: it.mapy ? parseFloat(it.mapy) : (it.latitude ? parseFloat(it.latitude) : NaN),
        lng: it.mapx ? parseFloat(it.mapx) : (it.longitude ? parseFloat(it.longitude) : NaN),
      }
      break
    }
    if(replacement) travelCards[unwantedIdx] = replacement
  }


const heroImage = ref('')
const heroTitle = ref('')
const heroDesc = ref('')

async function loadHero(){
  try{
    const res = await fetch('/docs/data/부산_관광지.json')
    const json = await res.json()
    const items = json.items || []
    let item = items.find(i=> i.title && i.title.includes('케이블카'))
    if(!item) item = items.find(i=> i.title && i.title.includes('송도')) || items[0]
    if(item){
      heroImage.value = item.firstimage || ''
      heroTitle.value = item.title || ''
      heroDesc.value = item.addr1 || ''
    }
  }catch(e){
    // ignore
  }
}
loadHero()

const festivalImage = ref('')
async function loadFestival(){
  try{
    const res = await fetch('/docs/data/부산_축제공연행사.json')
    const json = await res.json()
    const items = json.items || json
    let item = null
    if(Array.isArray(items)){
      item = items.find(it => it.title && it.title.includes('부산바다축제')) || items.find(it=>it.firstimage) || items[0]
    } else {
      item = items
    }
    if(item && item.firstimage) festivalImage.value = item.firstimage
  }catch(e){/* ignore */}
}
loadFestival()

const heroStyle = computed(()=>{
  const img = heroImage.value || ''
  if(!img) return {}
  // overlay gradient + background image, ensure cover and center
  return {
    backgroundImage: `linear-gradient(rgba(6,35,50,0.55), rgba(6,35,50,0.25)), url(${img})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})

const festivalStyle = computed(()=>{
  const img = festivalImage.value || ''
  if(!img) return {}
  return {
    backgroundImage: `linear-gradient(rgba(6,35,50,0.55), rgba(6,35,50,0.25)), url(${img})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})

const themes = [
  {title:'부산 바다 하루 코스',desc:'송정에서 광안리까지, 눈부신 부산의 해안선을 따라 떠나는 여행', img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop'},
  {title:'맛있는 부산',desc:'시장과 로컬 맛집', img:'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop'},
  {title:'초록 산책',desc:'공원과 숲길', img:'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop'}
]

const events = [
  {month:'JUL',day:'21',title:'광안리 드론 라이트쇼',where:'광안리해수욕장',time:'20:00'},
  {month:'JUL',day:'26',title:'부산 원도심 골목축제',where:'중구 일대',time:'14:00'},
  {month:'AUG',day:'02',title:'송정 서핑 페스티벌',where:'송정해수욕장',time:'10:00'},
]

const posts = [
  {title:'비 오는 날에도 좋았던 영도 카페 코스',meta:'여행자 해운대고래 · 댓글 12'},
  {title:'부산역에서 시작하는 반나절 원도심 여행',meta:'여행자 모모 · 댓글 8'},
  {title:'광안리 야경 사진 잘 나오는 시간 공유해요',meta:'여행자 파도 · 댓글 21'},
]

const notices = [
  {tag:'공지',title:'여름 성수기 해수욕장 이용 안내'},{tag:'교통',title:'부산 시티투어 노선 일부 변경'},{tag:'안전',title:'해안 산책로 이용 시 안전수칙'},{tag:'행사',title:'7월 지역 축제 사전 예약 안내'}
]
</script>

<style scoped>
/* Copied & adapted preview styles */
:root{--navy:#082f4f; --blue:#087ea4; --sky:#e8f7fb; --ink:#182532; --muted:#687886; --line:#e4ebef; --orange:#ff7a45; --white:#fff; --page:#eef3f6; --text-strong:#0b2b3a}
*{box-sizing:border-box} body{margin:0;background:var(--page);color:var(--ink);font-family:Pretendard,"Noto Sans KR",Arial,sans-serif;font-size:16px;line-height:1.6}
.inner{max-width:1180px;margin:0 auto;padding:0 24px}
.utility{height:34px;background:var(--navy);color:var(--hero-text);font-size:12px}
.utility .inner{height:100%;display:flex;justify-content:space-between;align-items:center}
.header{position:relative;z-index:10;height:82px;background:rgba(255,255,255,.96);border-bottom:1px solid rgba(8,47,79,.09)}
.header .inner{height:100%;display:flex;align-items:center;justify-content:space-between;gap:24px}
.brand{display:flex;align-items:center;gap:11px}
.mark{width:42px;height:42px;border-radius:14px;background:linear-gradient(145deg,#17a8c6,#087ea4);position:relative;box-shadow:0 8px 18px rgba(8,126,164,.28)}
.brand strong{font-size:22px;color:var(--navy)}.brand small{display:block;margin-top:3px;font-size:9px;color:var(--text-muted);font-weight:800}
.nav{display:flex;align-items:center;gap:24px}
.nav a{color:var(--text-strong);text-decoration:none;font-weight:900;font-size:16px}
.nav a.active{color:var(--blue)}
.icon-btn{width:40px;height:40px;border:1px solid var(--line);border-radius:12px;background:#fff;font-size:17px}

.hero{min-height:570px;position:relative;overflow:hidden;color:var(--hero-text);background-size:cover;background-position:center}
.sea-lines{position:absolute;inset:auto 0 0;height:190px;opacity:.55;background:repeating-radial-gradient(ellipse at 75% 130%,transparent 0 25px,rgba(255,255,255,.25) 27px 29px,transparent 31px 46px)}
.hero .inner{position:relative;z-index:1000;padding-top:78px;text-align:left}
.eyebrow{font-weight:900;font-size:14px;letter-spacing:.22em;color:#fff;text-align:left}
.hero h1{font-size:clamp(42px,6vw,76px);line-height:1.05;letter-spacing:-.055em;margin:14px 0 20px;color:#fff;text-align:left}
.hero h1 em{font-style:normal;color:#89f0ef}
.hero p{font-size:18px;line-height:1.75;color:rgba(255,255,255,0.96);max-width:650px;margin:0}
.search-box{margin-top:22px;width:min(680px,100%);height:64px;border-radius:18px;background:#fff;display:flex;align-items:center;padding:0 9px 0 22px;box-shadow:0 18px 42px rgba(0,28,45,.12)}
 .search-box input{border:0;outline:0;flex:1;min-width:0;font-size:16px;color:#000}
.search-box input::placeholder{color:#4b5563}
.search-box button{height:48px;border:0;border-radius:14px;padding:0 23px;background:var(--orange);color:#fff;font-weight:900}
.keywords{margin-top:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:13px}
.keywords span{color:rgba(255,255,255,0.85);margin-right:8px}
.keywords button{border:1px solid rgba(255,255,255,.32);background:rgba(255,255,255,.11);border-radius:999px;padding:7px 11px;color:#fff}
.suggestions{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap}
.suggestions button{background:rgba(255,255,255,0.14);color:#fff;border:1px solid rgba(255,255,255,0.18);padding:6px 10px;border-radius:999px;cursor:pointer}
.search-results{
  margin-top:14px;
  background:rgba(255,255,255,.12);
  border-radius:12px;
  padding:12px;
  color:#ffffff;
  max-width:680px;
  position:relative;
  z-index:999;
  margin-bottom:24px;
  max-height:300px;
  overflow:auto;
  box-shadow:0 8px 24px rgba(0,0,0,.12);
}
.search-results .results-head{font-weight:900;margin-bottom:8px;color:#ffffff}
.search-results ul{list-style:none;margin:0;padding:0}
.search-results .result-item{padding:8px 0;border-top:1px solid rgba(255,255,255,.06)}
.search-results .result-item:first-child{border-top:0}
.search-results .result-item strong{color:#ffffff}
.search-results .result-meta{font-size:12px;color:rgba(255,255,255,0.85);margin-top:6px}
.hero-card{position:absolute;right:25px;top:75px;width:305px;height:360px;background:linear-gradient(160deg,rgba(255,255,255,.96),rgba(238,251,253,.86));border-radius:30px;color:var(--ink);padding:24px;transform:rotate(2deg);box-shadow:0 32px 55px rgba(0,34,53,.30)}
.hero-card .visual{height:190px;border-radius:22px;position:relative;overflow:hidden}
.hero-card .visual .hero-img{width:100%;height:100%;object-fit:cover;display:block}
.hero-card small{display:block;margin-top:19px;color:var(--blue);font-weight:900}
.hero-card h3{font-size:23px;margin:7px 0}
.hero-card p{font-size:13px;line-height:1.55;color:var(--text-secondary);margin:0}
.quick-wrap{position:relative;z-index:4;margin-top:-52px;transition:margin-top .28s ease, transform .28s ease}
.quick-wrap.search-open{margin-top:24px;transform:translateY(8px);z-index:50}
.quick{max-width:1120px;margin:auto;background:#fff;border-radius:24px;padding:24px 22px;display:grid;grid-template-columns:repeat(7,1fr);box-shadow:0 16px 45px rgba(24,62,84,.08)}
.quick button{border:0;background:none;display:flex;flex-direction:column;align-items:center;gap:9px;color:var(--text-primary);font-size:14px;font-weight:900}
.quick .circle{width:64px;height:64px;border-radius:18px;background:var(--sky);display:grid;place-items:center;font-size:26px;transition:.18s}

.section{padding:84px 0}.section.alt{background:#f4f8fa}
.section-head{display:flex;justify-content:space-between;align-items:end;margin-bottom:28px}.section-label{color:var(--blue);font-size:12px;font-weight:900;letter-spacing:.18em}.section h2{font-size:34px;letter-spacing:-.045em;margin:8px 0 0;color:var(--navy)}.more{border:1px solid var(--line);background:#fff;border-radius:999px;padding:10px 16px;color:#49606f;font-weight:800}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.travel-card{border:1px solid var(--line);border-radius:22px;overflow:hidden;background:#fff;box-shadow:0 8px 26px rgba(16,47,66,.07);transition:.2s}
.thumb{height:220px;position:relative;overflow:hidden}
.thumb-img{width:100%;height:100%;object-fit:cover;display:block}
.thumb-placeholder{width:100%;height:100%;background:linear-gradient(135deg,#ddebe0,#c6d9e8);}
.thumb.one{background:linear-gradient(160deg,#97e1e7 0 45%,#238bab 46% 65%,#f5c46b 66%)}
.thumb.two{background:linear-gradient(145deg,#f9d19a,#fb8d66 42%,#294f68 43%)}
.thumb.three{background:linear-gradient(155deg,#a4d3ff,#3984c2 42%,#d9e4bd 43% 70%,#557b50 71%)}
.badge{position:absolute;left:15px;top:15px;background:#fff;color:var(--blue);padding:7px 10px;border-radius:999px;font-size:11px;font-weight:900}
.like{position:absolute;right:14px;top:14px;width:38px;height:38px;border-radius:50%;border:0;background:rgba(255,255,255,.9);font-size:17px}
.card-body{padding:19px}.card-body h3{font-size:20px;margin:0 0 9px}.card-body p{font-size:14px;color:var(--text-secondary);line-height:1.6;margin:0}.meta{margin-top:16px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;color:var(--text-muted);font-size:12px}
.theme-grid{display:grid;grid-template-columns:1.35fr 1fr 1fr;grid-template-rows:190px 190px;gap:18px}
.theme{border-radius:24px;overflow:hidden;padding:24px;position:relative;color:#fff;background-size:cover;background-position:center}
.theme:first-child{grid-row:span 2}
.theme:nth-child(2){}
.theme:nth-child(3){}
.theme:nth-child(4){}
.theme:nth-child(5){}
.theme:after{content:"";position:absolute;width:150px;height:150px;border:28px solid rgba(255,255,255,.12);border-radius:50%;right:-48px;bottom:-68px}
.theme .num{font-size:12px;font-weight:900;color:rgba(255,255,255,.72)}.theme h3{font-size:24px;margin:18px 0 6px}
.festival{display:grid;grid-template-columns:1.2fr 1fr;gap:22px}.festival-main{min-height:320px;border-radius:28px;padding:36px;color:#fff;background:linear-gradient(125deg,#082f4f 0 55%,#0ea8b5);position:relative;overflow:hidden}.festival-main .date{display:inline-block;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:8px 13px;font-size:12px}
.festival-list{display:grid;gap:12px}.event{display:grid;grid-template-columns:72px 1fr auto;align-items:center;gap:16px;border:1px solid var(--line);border-radius:18px;padding:14px 16px;background:#fff}.event-date{height:64px;border-radius:14px;background:var(--sky);display:flex;flex-direction:column;justify-content:center;align-items:center;color:var(--blue);font-weight:900}.event-date strong{font-size:22px}.event h4{margin:0 0 6px;font-size:15px}.event p{margin:0;font-size:12px;color:var(--muted)}.arrow{color:var(--text-muted);font-size:20px}
.community{display:grid;grid-template-columns:1fr 1fr;gap:22px}.post-list,.notice{border:1px solid var(--line);border-radius:24px;background:#fff;padding:24px}.panel-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.panel-title h3{margin:0;font-size:21px;color:var(--navy)}.post{padding:15px 0;border-bottom:1px solid var(--line)}.post:last-child{border-bottom:0}.post strong{display:block;font-size:14px}.post span{display:block;margin-top:6px;font-size:12px;color:var(--muted)}.notice-row{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--line);font-size:13px}.notice-row:last-child{border:0}.notice-row b{color:var(--blue)}
.footer{background:#072b47;color:#dbe8ef;padding:50px 0 36px}.footer .inner{display:flex;justify-content:space-between;gap:40px}.footer-brand{font-size:24px;font-weight:900}.footer p{font-size:12px;line-height:1.7;color:var(--text-muted)}.footer-links{display:flex;gap:20px;font-size:12px;font-weight:800}
@media(max-width:900px){.quick{grid-template-columns:repeat(4,1fr)}.theme-grid{grid-template-columns:1fr 1fr}.cards{grid-template-columns:repeat(2,1fr)}.hero-card{display:none}}
</style>
