<template>
  <section class="home container">
    <section class="hero">
      <div class="container">
        <h1 class="title">LocalHub</h1>
        <p class="catch">부산을 방문을 환영해요!</p>
        <p class="lead">
          부산의 공공데이터와 익명 게시판을 통해 지역 정보를 쉽게 확인하세요.
        </p>
      </div>
    </section>

    <section class="home-section container">
      <div class="cards">
        <div class="card">
          <h3>부산 게시판</h3>
          <p>지역 방문객들과 익명으로 정보를 주고받는 공간입니다.</p>
          <router-link to="/board" class="btn">게시판 가기</router-link>
        </div>
        <div class="card">
          <h3>부산 관광데이터</h3>
          <p>카테고리를 선택하면 지도로 바로 확인할 수 있습니다.</p>
          <div class="cat-select">
            <div class="category-grid">
              <button v-for="c in categories" :key="c.key" class="cat-btn" @click="selectedCategory = c.key">
                <span class="icon">{{ c.icon }}</span>
                <span class="label">{{ c.label }}</span>
              </button>
            </div>
            <router-link :to="{ path: '/map', query: { category: selectedCategory } }" class="btn">지도에서 보기</router-link>
          </div>
        </div>
        <div class="card">
          <h3>최근 추천 게시글</h3>
          <ul>
            <li v-for="p in topPosts" :key="p.id">
              <router-link :to="{ path: '/board', query: { id: p.id } }"
                >{{ p.title }} (추천 {{ p.count }})</router-link
              >
            </li>
          </ul>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";
import initialPosts from "../../docs/data/board.json";

const selectedCategory = ref("");

const categories = [
  { key: "관광지", label: "관광지", icon: "🗺️" },
  { key: "레포츠", label: "레포츠", icon: "🏄" },
  { key: "문화시설", label: "문화시설", icon: "🏛️" },
  { key: "쇼핑", label: "쇼핑", icon: "🛍️" },
  { key: "숙박", label: "숙박", icon: "🛏️" },
  { key: "여행코스", label: "여행코스", icon: "🧭" },
  { key: "축제공연행사", label: "축제/공연/행사", icon: "🎉" },
]

function loadRecommends() {
  try {
    const raw = localStorage.getItem("localhub_recommends");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

const recommends = loadRecommends();

const counts = {};
const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
recommends.forEach((r) => {
  if (r.ts >= weekAgo) {
    counts[r.postId] = (counts[r.postId] || 0) + 1;
  }
});

const topPosts = computed(() => {
  const arr = initialPosts.map((p) => ({
    id: p.id,
    title: p.title,
    count: counts[p.id] || 0,
  }));
  return arr.sort((a, b) => b.count - a.count).slice(0, 6);
});
</script>

<style scoped>
:root {
  --sea-1: #0078d4;
  --sea-2: #00a6d6;
  --muted: #666;
}
.home {
  padding: 24px;
}
.hero {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 32px;
  background: linear-gradient(
    180deg,
    rgba(0, 120, 212, 0.06),
    rgba(0, 166, 214, 0.03)
  );
  border-radius: 12px;
}
.hero-text {
  flex: 1;
}
.title {
  font-size: 2.25rem;
  color: var(--sea-1);
  margin: 0;
}
.catch {
  font-size: 1.25rem;
  color: var(--sea-2);
  margin: 8px 0;
  font-weight: 600;
}
.lead {
  color: var(--muted);
  margin: 8px 0 0;
}
.hero-graphic {
  width: 260px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wave {
  width: 220px;
  height: 120px;
  border-radius: 12px;
  background: linear-gradient(180deg, #e6f7ff, #dff6fb);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 120, 212, 0.08);
}
.wave::before,
.wave::after {
  content: "";
  position: absolute;
  left: -10%;
  width: 120%;
  height: 40%;
  background: rgba(0, 166, 214, 0.12);
  border-radius: 40%;
  transform: translateY(60%);
  opacity: 0.9;
}
.wave::after {
  transform: translateY(80%);
  opacity: 0.6;
}
.boat {
  position: absolute;
  left: 18%;
  top: 24%;
  font-size: 28px;
}
.fish {
  position: absolute;
  right: 18%;
  bottom: 18%;
  font-size: 20px;
}

.intro {
  margin-top: 20px;
  background: #fff;
  padding: 16px;
  border-radius: 10px;
}
.intro h2 {
  margin: 0 0 8px;
  color: var(--sea-1);
}
.intro p {
  margin: 6px 0;
  color: var(--muted);
}
.source {
  font-size: 0.9rem;
  color: #333;
  margin-top: 10px;
}

@media (max-width: 720px) {
  .hero {
    flex-direction: column;
  }
  .hero-graphic {
    width: 100%;
    height: 160px;
  }
}

.home-section .cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}
.home-section .card {
  width: 100%;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}
.cat-select {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 8px;
}
.home-section ul {
  padding: 0;
  list-style: none;
}
.category-grid{display:flex;flex-wrap:wrap;gap:8px}
.cat-card{display:flex;flex-direction:column;align-items:center;padding:8px;border-radius:8px;border:1px solid #eee;min-width:80px;text-align:center;text-decoration:none;color:inherit}
.cat-icon{font-size:22px}
.cat-label{font-size:0.95rem;margin-top:6px}
.cat-btn{background:#fff;border:1px solid #eee;padding:8px;border-radius:8px;cursor:pointer}
</style>
