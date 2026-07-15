<template>
  <div class="app">
    <header class="site-header">
      <div class="container">
        <router-link to="/" class="logo">LocalHub</router-link>
        <nav class="nav">
          <router-link class="nav-item" to="/board">부산 게시판</router-link>
          <router-link class="nav-item" to="/map">지도</router-link>
          <router-link class="nav-item" to="/dashboard">대시보드</router-link>
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

<style scoped>
:root {
  --bg: #fafafa;
  --card: #fff;
  --accent: #0078d4;
  --muted: #666;
}
* {
  box-sizing: border-box;
}
body,
html,
#app {
  height: 100%;
  margin: 0;
  font-family:
    Inter,
    Segoe UI,
    Arial,
    sans-serif;
  background: var(--bg);
  color: #222;
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
}
.site-header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
}
.site-header .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
}
.logo {
  font-weight: 700;
  color: var(--accent);
  font-size: 1.25rem;
}
.nav {
  display: flex;
  gap: 12px;
}
.nav-item {
  color: var(--muted);
  text-decoration: none;
  font-weight: 600;
}
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
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: not-allowed;
}
.btn.ghost {
  background: transparent;
  border: 1px solid #ccc;
  color: var(--muted);
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
