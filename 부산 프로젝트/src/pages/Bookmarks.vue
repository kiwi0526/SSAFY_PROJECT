<template>
  <div class="container bookmarks-page">
    <h2>북마크한 게시글</h2>
    <p v-if="bookmarkedPosts.length===0">북마크된 게시글이 없습니다.</p>
      <ul v-else class="posts">
        <li v-for="post in bookmarkedPosts" :key="post.id" class="post-item">
          <div class="post-meta">
            <strong class="post-title">
              <router-link :to="{ path: '/board', query: { id: post.id } }">{{ post.title }}</router-link>
            </strong>
            <span class="post-author">by {{ post.author }}</span>
            <span class="post-time">{{ formatDate(post.created_at) }}</span>
          </div>
          <p class="post-content">{{ post.content }}</p>
          <div class="post-actions">
            <button class="btn" @click="removeBookmark(post.id)">북마크 제거</button>
          </div>
        </li>
      </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import initialData from '../../docs/data/board.json'

const STORAGE_KEY = 'localhub_board_posts'
const BOOKMARK_KEY = 'localhub_bookmarks'

function loadPosts(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    if(raw) return JSON.parse(raw)
  }catch(e){ console.warn('load posts', e) }
  return initialData.map(p=>({...p}))
}

function loadBookmarks(){
  try{ const raw = localStorage.getItem(BOOKMARK_KEY); if(raw) return JSON.parse(raw) }catch(e){ console.warn(e) }
  return []
}

const posts = ref(loadPosts())
const bookmarks = ref(loadBookmarks())

function persistBookmarks(){ localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks.value)) }

const bookmarkedPosts = computed(()=>{
  const ids = new Set(bookmarks.value)
  return posts.value.filter(p => ids.has(p.id))
})

function removeBookmark(id){
  bookmarks.value = bookmarks.value.filter(x=> x!==id)
  persistBookmarks()
}

function formatDate(iso){ try{ return new Date(iso).toLocaleString() }catch(e){ return iso } }
</script>

<style scoped>
.container{padding:24px}
.posts{list-style:none;padding:0;margin:0}
.post-item{background:#fff;padding:12px;border-radius:6px;margin-bottom:12px;box-shadow:0 1px 2px rgba(0,0,0,0.04)}
.post-meta{display:flex;gap:12px;align-items:center}
.post-title{font-size:1.05rem}
.post-author{color:#666;font-size:0.9rem}
.post-time{color:#999;font-size:0.8rem;margin-left:auto}
.post-actions{margin-top:8px}
.btn{padding:6px 10px;border-radius:6px;border:none;background:#eee;cursor:pointer}
.btn.danger{background:#ff6b6b;color:#fff}
</style>
