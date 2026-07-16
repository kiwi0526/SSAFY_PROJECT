<template>
  <div class="app">
    <header class="site-header">
      <div class="container">
        <router-link to="/" class="logo">LocalHub</router-link>
        <nav class="nav">
          <router-link class="nav-item home-link" to="/">홈</router-link>
          <router-link class="nav-item" to="/board">부산 게시판</router-link>
          <router-link class="nav-item" to="/map">지도</router-link>
          <router-link class="nav-item" to="/calendar">축제 캘린더</router-link>
          <router-link class="nav-item" to="/bookmarks">북마크</router-link>
        </nav>
      </div>
    </header>

    <main>
      <router-view />
    </main>

    <footer class="site-footer">
      <div class="container">© LocalHub</div>
    </footer>
  </div>
  <ChatWidget />
</template>

<script>
import ChatWidget from "./components/ChatWidget.vue";

export default {
  name: "App",
  components: { ChatWidget },
};
</script>

<style>
:root {
  --navy:#082f4f; --blue:#087ea4; --sky:#e8f7fb; --ink:#182532; --muted:#687886;
  --line:#e4ebef; --orange:#ff7a45; --white:#fff; --page:#eef3f6;
  --text-primary: #0b2b3a; /* main readable text */
  --text-secondary: #4b5960; /* secondary text */
  --text-muted: #7b8b95; /* muted / placeholder */
  --hero-text: #ffffff;
}
* {
  box-sizing: border-box;
}
body,
html,
#app {
  height: 100%;
  margin: 0;
  font-family: Pretendard, "Noto Sans KR", Segoe UI, Arial, sans-serif;
  background: var(--page);
  color: #222;
  overflow-x: hidden;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
}
.site-header {
  background: linear-gradient(90deg, #005f99 0%, #00a6d6 100%);
  color: #fff;
  border-bottom: none;
}
.site-header .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}
.logo {
  font-weight: 700;
  color: #fff;
  font-size: 1.25rem;
}
.nav {
  display: flex;
  gap: 12px;
  margin-left: auto;
}
.site-header .nav-item {
  color: #fff !important;
  text-decoration: none;
  font-weight: 700;
}
.site-header .nav-item.home-link{font-weight:900;margin-right:8px}
.site-header .nav-item:hover{opacity:0.9}
.hero {
  padding: 64px 0;
  text-align: center;
}
.hero-title {
  font-size: 2.25rem;
  margin: 0;
}
.hero-sub {
  color: var(--muted);
  margin: 12px 0 20px;
}
.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.btn {
  background: #fff;
  color: #0078d4;
  border: none;
  padding: 10px 16px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
}
.btn.primary {
  background: #ff7a59;
  color: #fff;
}
.btn.ghost {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.9);
}
.features {
  display: flex;
  gap: 16px;
  padding: 40px 0;
}
.card {
  flex: 1;
  background: var(--card);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.card h3 {
  margin: 0 0 8px;
}
.site-footer {
  padding: 16px 0;
  border-top: 1px solid #eee;
  color: var(--muted);
  text-align: center;
}

@media (max-width: 720px) {
  .features {
    flex-direction: column;
  }
  .nav {
    display: none;
  }
  .hero {
    padding: 40px 0;
  }
}
</style>
