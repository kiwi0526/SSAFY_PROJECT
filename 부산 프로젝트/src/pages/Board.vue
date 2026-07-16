<template>
  <div class="board container">
    <h2>부산 게시판</h2>

    <section class="new-post">
      <h3>{{ editingId ? '게시글 수정' : '새 게시글 작성' }}</h3>
      <form @submit.prevent="savePost">
        <div class="field"><input v-model="form.title" placeholder="제목" required /></div>
        <div class="field"><input v-model="form.author" placeholder="작성자" required /></div>
        <div class="field"><textarea v-model="form.content" placeholder="본문" rows="4" required></textarea></div>
        <div class="field"><input v-model="form.tagsInput" placeholder="태그 (콤마로 구분, 예: 해운대,맛집)" /></div>
        <div class="field file-input">
          <label>이미지 첨부 (선택)</label>
          <input type="file" accept="image/*" @change="onFileChange" />
          <div v-if="form.image" class="image-preview">
            <img :src="form.image" alt="preview" />
            <button type="button" class="btn" @click="removeImage">이미지 제거</button>
          </div>
        </div>
        <div class="field"><input v-model="form.password" placeholder="비밀번호 (수정/삭제 권한)" /></div>
        <div class="actions">
          <button type="submit" class="btn primary">{{ editingId ? '수정' : '작성' }}</button>
          <button type="button" class="btn" @click="resetForm">취소</button>
        </div>
      </form>
    </section>

    <section class="posts">
      <div class="posts-header">
        <h3>게시글 목록 (총 {{ filteredCount }})</h3>
        <div class="posts-controls">
          <input v-model="searchQuery" placeholder="검색어로 제목/작성자/본문 검색" />
          <select v-model.number="pageSize" aria-label="페이지 크기">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
          </select>
        </div>
        <div class="tag-filters">
          <button v-for="tag in availableTags" :key="tag" :class="['tag-btn', {selected: selectedTags.includes(tag)}]" @click="toggleTag(tag)">#{{ tag }}</button>
          <button v-if="selectedTags.length" class="clear-tags" @click="clearTags">초기화</button>
        </div>
      </div>
      <ul>
        <li v-for="post in paginatedPosts" :key="post.id" :id="'post-'+post.id" :class="{ highlighted: highlightedId==post.id }" class="post-item">
          <div class="post-meta">
            <strong class="post-title">{{ post.title }}</strong>
            <span class="post-author">by {{ post.author }}</span>
            <span class="post-time">{{ formatDate(post.created_at) }}</span>
            <span style="margin-left:12px;color:var(--orange);font-weight:600">추천: {{ weeklyRecommendCount(post.id) }}</span>
          </div>
          <div class="post-body">
            <p class="post-content">{{ post.content }}</p>
            <div v-if="post.image" class="post-thumb"><img :src="post.image" alt="post image" /></div>
          </div>
          <div class="post-actions">
            <button class="btn" @click="startEdit(post)">편집</button>
            <button class="btn danger" @click="removePost(post.id)">삭제</button>
            <button class="btn" @click="toggleBookmark(post)">{{ isBookmarked(post.id) ? '북마크 제거' : '북마크' }}</button>
            <button class="btn" @click="recommend(post)">추천</button>
          </div>
        </li>
      </ul>

      <div class="pagination">
        <button class="btn" :disabled="page<=1" @click="page--">이전</button>
        <span> {{ page }} / {{ totalPages || 1 }} </span>
        <button class="btn" :disabled="page>=totalPages" @click="page++">다음</button>
      </div>
    </section>

    <!-- 비밀번호 입력 모달 -->
    <div v-if="authModal" class="auth-modal">
      <div class="auth-backdrop" @click="cancelAuth"></div>
      <div class="auth-dialog">
        <h4>{{ authAction }} 권한 확인</h4>
        <input v-model="authInput" placeholder="비밀번호를 입력하세요" />
        <div class="actions">
          <button class="btn primary" @click="confirmAuth">확인</button>
          <button class="btn" @click="cancelAuth">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import initialData from '../../docs/data/board.json'

const STORAGE_KEY = 'localhub_board_posts'

const BOOKMARK_KEY = 'localhub_bookmarks'
const RECOMMEND_KEY = 'localhub_recommends'

function loadPosts(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    if(raw){
      return JSON.parse(raw)
    }
  }catch(e){ console.warn('localStorage parse error', e) }
  // fallback to initial data
  return initialData.map(p => ({ ...p }))
}

const posts = ref(loadPosts())
const editingId = ref(null)
const form = ref({ title: '', author: '', content: '', tagsInput: '', password: '', image: '' })

const bookmarks = ref(loadBookmarks())
const recommends = ref(loadRecommends())

function persist(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.value))
}

function parseTags(input){
  if(!input) return []
  return input.split(',').map(t=>t.trim()).filter(Boolean).map(t=>t.toLowerCase())
}

function encodePwd(p){
  try{ return p ? btoa(String(p)) : null }catch(e){ return p }
}

function loadBookmarks(){
  try{
    const raw = localStorage.getItem(BOOKMARK_KEY)
    if(raw) return JSON.parse(raw)
  }catch(e){ console.warn('bookmark parse', e) }
  return []
}

function persistBookmarks(){
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks.value))
}

function loadRecommends(){
  try{
    const raw = localStorage.getItem(RECOMMEND_KEY)
    if(raw) return JSON.parse(raw)
  }catch(e){ console.warn('recommends parse', e) }
  return []
}

function persistRecommends(){
  localStorage.setItem(RECOMMEND_KEY, JSON.stringify(recommends.value))
}

function recommend(post){
  const ts = Date.now()
  recommends.value.push({ postId: post.id, ts })
  persistRecommends()
}

function weeklyRecommendCount(postId){
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return recommends.value.filter(r => r.postId === postId && r.ts >= weekAgo).length
}

function isBookmarked(id){
  return bookmarks.value.includes(id)
}

function toggleBookmark(post){
  const id = post.id
  if(isBookmarked(id)){
    bookmarks.value = bookmarks.value.filter(x=> x !== id)
  }else{
    bookmarks.value = [id, ...bookmarks.value]
  }
  persistBookmarks()
}

const sortedPosts = computed(() => {
  return [...posts.value].sort((a,b)=> new Date(b.created_at) - new Date(a.created_at))
})

// search + pagination
const searchQuery = ref('')
const page = ref(1)
const pageSize = ref(10)
const selectedTags = ref([])

const availableTags = computed(()=>{
  const s = new Set()
  posts.value.forEach(p=>{
    (p.tags||[]).forEach(t=> s.add(t))
  })
  return Array.from(s)
})

const filteredPosts = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim()
  return sortedPosts.value.filter(p => {
    const matchesText = !q || (p.title||'').toLowerCase().includes(q)
      || (p.author||'').toLowerCase().includes(q)
      || (p.content||'').toLowerCase().includes(q)
    const matchesTags = selectedTags.value.length === 0 || selectedTags.value.every(t => (p.tags||[]).includes(t))
    return matchesText && matchesTags
  })
})

const filteredCount = computed(() => filteredPosts.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredCount.value / pageSize.value)))

watch([searchQuery, pageSize, filteredCount], ()=>{
  if(page.value > totalPages.value) page.value = totalPages.value || 1
})

const paginatedPosts = computed(()=>{
  const start = (page.value - 1) * pageSize.value
  return filteredPosts.value.slice(start, start + pageSize.value)
})

// route-based highlight/scroll for bookmarked items
const route = useRoute()
const highlightedId = ref(null)
watch(()=> route.query.id, async (id) => {
  if(!id){ highlightedId.value = null; return }
  highlightedId.value = isNaN(id) ? id : Number(id)
  await nextTick()
  const el = document.getElementById('post-' + highlightedId.value)
  if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
})

function resetForm(){
  editingId.value = null
  form.value = { title:'', author:'', content:'', tagsInput:'', password: '', image: '' }
}
function savePost(){
  if(editingId.value){
    const idx = posts.value.findIndex(p => p.id === editingId.value)
    if(idx !== -1){
      posts.value[idx].title = form.value.title
      posts.value[idx].author = form.value.author
      posts.value[idx].content = form.value.content
      // update image (allow clearing)
      posts.value[idx].image = form.value.image || null
      // update password only if a new one was provided
      if(form.value.password) posts.value[idx].password = encodePwd(form.value.password)
      posts.value[idx].tags = parseTags(form.value.tagsInput)
      posts.value[idx].created_at = new Date().toISOString()
    }
  }else{
    const id = Date.now()
    posts.value.unshift({ id, title: form.value.title, author: form.value.author, content: form.value.content, created_at: new Date().toISOString(), password: form.value.password ? encodePwd(form.value.password) : null, tags: parseTags(form.value.tagsInput), image: form.value.image || null })
  }
  persist()
  resetForm()
}

const authModal = ref(false)
const authAction = ref('')
const authPostId = ref(null)
const authInput = ref('')

function openAuth(post, action){
  if(!post.password){
    // 비밀번호가 설정되지 않은 글은 삭제/수정 모두 차단
    alert('이 글은 비밀번호가 설정되어 있지 않습니다. 삭제하려면 글 작성 시 비밀번호를 설정하세요.')
    return
  }
  authPostId.value = post.id
  authAction.value = action
  authInput.value = ''
  authModal.value = true
}

function toggleTag(tag){
  if(selectedTags.value.includes(tag)) selectedTags.value = selectedTags.value.filter(t=>t!==tag)
  else selectedTags.value = [...selectedTags.value, tag]
}

function clearTags(){ selectedTags.value = [] }

function confirmAuth(){
  const post = posts.value.find(p=>p.id === authPostId.value)
  if(!post){ cancelAuth(); return }
  if(encodePwd(authInput.value) !== post.password){ alert('비밀번호가 일치하지 않습니다.'); return }
  if(authAction.value === '삭제'){
    if(!confirm('게시글을 삭제하시겠습니까?')){ cancelAuth(); return }
    posts.value = posts.value.filter(p=>p.id!==post.id)
    persist()
  }else if(authAction.value === '수정'){
    editingId.value = post.id
    form.value = { title: post.title, author: post.author, content: post.content, tagsInput: (post.tags||[]).join(','), password: '', image: post.image || '' }
  }
  cancelAuth()
}

function cancelAuth(){
  authModal.value = false
  authAction.value = ''
  authPostId.value = null
  authInput.value = ''
}

function startEdit(post){ openAuth(post, '수정') }

function removePost(id){
  const post = posts.value.find(p=>p.id===id)
  if(!post) return
  openAuth(post, '삭제')
}

function formatDate(iso){
  try{ return new Date(iso).toLocaleString() }catch(e){ return iso }
}

// image handlers
function onFileChange(e){
  const f = e.target.files && e.target.files[0]
  if(!f) return
  if(!f.type.startsWith('image/')){ alert('이미지 파일만 업로드 가능합니다.'); return }
  const reader = new FileReader()
  reader.onload = (ev) => {
    form.value.image = ev.target.result
  }
  reader.readAsDataURL(f)
}

function removeImage(){
  form.value.image = ''
  // also clear the file input element if needed
  // (the template input won't persist the file across resets)
}
</script>

<style scoped>
.container{padding:24px}
.new-post{margin-bottom:24px;background:#fff;padding:16px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.04)}
.field{margin-bottom:8px}
.field input,.field textarea{width:100%;padding:8px;border:1px solid #ddd;border-radius:4px}
.actions{display:flex;gap:8px}
.posts ul{list-style:none;padding:0;margin:0}
.post-item{background:#fff;padding:12px;border-radius:6px;margin-bottom:12px;box-shadow:0 1px 2px rgba(0,0,0,0.04)}
.post-meta{display:flex;gap:12px;align-items:center}
.post-title{font-size:1.05rem}
.post-author{color:var(--text-secondary);font-size:0.9rem}
.post-time{color:var(--text-muted);font-size:0.8rem;margin-left:auto}
.post-actions{margin-top:8px;display:flex;gap:8px}
.post-body{display:flex;gap:12px;align-items:flex-start;margin-top:8px}
.post-thumb img{max-width:160px;max-height:120px;border-radius:6px;object-fit:cover}
.image-preview img{max-width:180px;max-height:140px;border-radius:6px;display:block;margin-top:8px}
.file-input label{display:block;font-size:13px;color:var(--text-secondary);margin-bottom:6px}
.btn{padding:6px 10px;border-radius:6px;border:none;background:#eee;cursor:pointer}
.btn.primary{background:#0078d4;color:#fff}
.btn.danger{background:#ff6b6b;color:#fff}
.highlighted{box-shadow:0 0 0 3px rgba(255,215,0,0.25);background:#fffbe6}
/* tag filter styles */
.tag-filters{margin-top:12px;display:flex;gap:8px;flex-wrap:wrap}
.tag-btn{background:#f1f5f9;border:1px solid #e6eef3;padding:6px 10px;border-radius:999px;cursor:pointer;color:var(--text-primary)}
.tag-btn.selected{background:#0078d4;color:#fff;border-color:#0078d4}
.clear-tags{background:transparent;border:0;color:var(--danger, #ff6b6b);cursor:pointer;font-weight:800}
</style>
