<template>
  <section class="home-preview">
    <div class="utility"><div class="inner"><span>부산의 모든 여행 정보를 한곳에서</span><div class="utility-links"><span>로그인</span><span>회원가입</span><span>한국어⌄</span></div></div></div>
    <header class="header"><div class="inner">
      <div class="brand"><div class="mark"></div><div><strong>Local<span>Hub</span></strong><small>DISCOVER BUSAN</small></div></div>
      <nav class="nav"><a class="active" href="#home">홈</a><a href="#recommend">여행지</a><a href="#theme">테마여행</a><a href="#festival">축제·행사</a><a href="#community">여행 커뮤니티</a></nav>
      <div class="header-tools"><button class="icon-btn">♡</button><button class="icon-btn menu-btn">☰</button></div>
    </div></header>

    <section class="hero" id="home"><div class="sea-lines"></div><div class="inner">
      <div class="eyebrow">BUSAN TRAVEL CURATION</div>
      <h1>부산을 가장<br><em>부산답게</em> 여행하는 법</h1>
      <p>바다와 골목, 축제와 맛집까지. 지금의 부산을 발견하고 나만의 여행을 계획해 보세요.</p>
      <form class="search-box" @submit.prevent="onSearch"><input v-model="searchQuery" placeholder="어디로 떠나고 싶나요?" /><button>여행지 검색</button></form>
      <div class="keywords"><span>추천 검색어</span><button @click="setKeyword('광안리')">광안리</button><button @click="setKeyword('해운대')">해운대</button><button @click="setKeyword('감천문화마을')">감천문화마을</button><button @click="setKeyword('부산축제')">부산축제</button></div>
      <article class="hero-card">
        <div class="visual">
          <img :src="heroImage" alt="송도 해상 케이블카" class="hero-img" />
        </div>
        <small>LOCAL PICK 01</small>
        <h3>송도 해상 케이블카</h3>
        <p>바다 위를 가로지르며 만나는 부산의 새로운 풍경</p>
      </article>
    </div></section>

    <div class="quick-wrap"><div class="quick">
      <button v-for="q in quicks" :key="q.label"><span class="circle">{{ q.icon }}</span>{{ q.label }}</button>
    </div></div>

    <section class="section" id="recommend"><div class="inner"><div class="section-head"><div><div class="section-label">RECOMMENDED PLACE</div><h2>지금 부산에서 꼭 가볼 곳</h2></div><button class="more">전체 보기 →</button></div>
      <div class="cards">
        <article v-for="c in travelCards" :key="c.title" class="travel-card">
          <div :class="['thumb', c.thumb]">
            <img :src="c.img" alt="" class="thumb-img" />
            <span class="badge">{{ c.tag }}</span>
            <button class="like">♡</button>
          </div>
          <div class="card-body"><h3>{{ c.title }}</h3><p>{{ c.desc }}</p><div class="meta"><span>{{ c.region }}</span><span>조회 {{ c.views }}</span></div></div>
        </article>
      </div>
    </div></section>

    <section class="section alt" id="theme"><div class="inner"><div class="section-head"><div><div class="section-label">THEME TRAVEL</div><h2>취향대로 즐기는 부산</h2></div><button class="more">테마 더보기 →</button></div>
      <div class="theme-grid">
        <article v-for="(t,i) in themes" :key="t.title" class="theme"><span class="num">{{ (i+1).toString().padStart(2,'0') }}</span><h3>{{ t.title }}</h3><p>{{ t.desc }}</p></article>
      </div>
    </div></section>

    <section class="section" id="festival"><div class="inner"><div class="section-head"><div><div class="section-label">FESTIVAL & EVENT</div><h2>오늘 부산에서 만나는 즐거움</h2></div><button class="more">캘린더 보기 →</button></div>
      <div class="festival"><article class="festival-main"><span class="date">2026. 07. 18 — 08. 24</span><h3>부산 바다축제</h3><p>여름 바다를 배경으로 펼쳐지는 공연과 체험, 부산을 대표하는 계절 축제를 만나보세요.</p></article><div class="festival-list">
        <article v-for="e in events" :key="e.title" class="event"><div class="event-date"><span>{{ e.month }}</span><strong>{{ e.day }}</strong></div><div><h4>{{ e.title }}</h4><p>{{ e.where }} · {{ e.time }}</p></div><span class="arrow">›</span></article>
      </div></div>
    </div></section>

    <section class="section alt" id="community"><div class="inner"><div class="section-head"><div><div class="section-label">TRAVEL COMMUNITY</div><h2>여행자들의 부산 이야기</h2></div></div>
      <div class="community"><div class="post-list"><div class="panel-title"><h3>인기 여행 후기</h3><button class="more">더보기</button></div><div v-for="p in posts" :key="p.title" class="post"><strong>{{ p.title }}</strong><span>{{ p.meta }}</span></div></div>
      <div class="notice"><div class="panel-title"><h3>여행 알림</h3><button class="more">전체</button></div><div v-for="n in notices" :key="n.title" class="notice-row"><b>{{ n.tag }}</b><span>{{ n.title }}</span></div></div></div>
    </div></section>

    <footer class="footer"><div class="inner"><div><div class="footer-brand">LocalHub Busan</div><p>부산 여행정보와 지역 커뮤니티를 연결하는 로컬 여행 플랫폼<br>© 2026 LocalHub. All rights reserved.</p></div><div class="footer-links"><span>이용약관</span><span>개인정보처리방침</span><span>관광정보 수정요청</span></div></div></footer>
  </section>
</template>

<script setup>
import { ref } from 'vue'
const searchQuery = ref('')
function onSearch(){alert((searchQuery.value||'부산 여행지')+ ' 검색 미리보기')}
function setKeyword(k){searchQuery.value=k;onSearch()}

const quicks = [
  {icon:'🌊',label:'관광지'},{icon:'🏨',label:'숙박'},{icon:'🎨',label:'문화시설'},{icon:'🎉',label:'축제·행사'},{icon:'🚲',label:'레포츠'},{icon:'🛍️',label:'쇼핑'},{icon:'🗺️',label:'여행코스'}
]

const travelCards = [
  {thumb:'one',tag:'바다여행',title:'흰여울문화마을',desc:'절벽 위 골목과 푸른 바다가 어우러진 부산의 대표 산책 명소',region:'영도구',views:'2,431', img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=1'},
  {thumb:'two',tag:'골목여행',title:'감천문화마을',desc:'알록달록한 집과 예술작품을 따라 걷는 부산의 특별한 골목',region:'사하구',views:'3,802', img:'https://images.unsplash.com/photo-1543248939-5a0a1a9f3b6b?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=2'},
  {thumb:'three',tag:'자연여행',title:'태종대 유원지',desc:'기암절벽과 울창한 숲, 탁 트인 바다를 한 번에 만나는 곳',region:'영도구',views:'1,948', img:'https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=3'},
]

const heroImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=1'

const themes = [
  {title:'부산 바다 하루 코스',desc:'송정에서 광안리까지, 눈부신 부산의 해안선을 따라 떠나는 여행'},
  {title:'맛있는 부산',desc:'시장과 로컬 맛집'},
  {title:'야경 명소',desc:'빛나는 부산의 밤'},
  {title:'초록 산책',desc:'공원과 숲길'},
  {title:'역사 여행',desc:'시간을 걷는 골목'}
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
:root{--navy:#082f4f; --blue:#087ea4; --sky:#e8f7fb; --ink:#182532; --muted:#687886; --line:#e4ebef; --orange:#ff7a45; --white:#fff; --page:#eef3f6;}
*{box-sizing:border-box} body{margin:0;background:var(--page);color:var(--ink);font-family:Pretendard,"Noto Sans KR",Arial,sans-serif}
.inner{max-width:1180px;margin:0 auto;padding:0 24px}
.utility{height:34px;background:var(--navy);color:#dce9f0;font-size:12px}
.utility .inner{height:100%;display:flex;justify-content:space-between;align-items:center}
.header{position:relative;z-index:10;height:82px;background:rgba(255,255,255,.96);border-bottom:1px solid rgba(8,47,79,.09)}
.header .inner{height:100%;display:flex;align-items:center;justify-content:space-between;gap:24px}
.brand{display:flex;align-items:center;gap:11px}
.mark{width:42px;height:42px;border-radius:14px;background:linear-gradient(145deg,#17a8c6,#087ea4);position:relative;box-shadow:0 8px 18px rgba(8,126,164,.28)}
.brand strong{font-size:22px;color:var(--navy)}.brand small{display:block;margin-top:3px;font-size:9px;color:#80909b;font-weight:800}
.nav{display:flex;align-items:center;gap:24px}
.nav a{color:#334452;text-decoration:none;font-weight:800;font-size:15px}
.nav a.active{color:var(--blue)}
.icon-btn{width:40px;height:40px;border:1px solid var(--line);border-radius:12px;background:#fff;font-size:17px}

.hero{min-height:570px;position:relative;overflow:hidden;color:#fff;background:radial-gradient(circle at 76% 30%,rgba(68,212,232,.55),transparent 25%),linear-gradient(120deg,#052d4d 0%,#096c8c 48%,#31b1c4 100%)}
.sea-lines{position:absolute;inset:auto 0 0;height:190px;opacity:.55;background:repeating-radial-gradient(ellipse at 75% 130%,transparent 0 25px,rgba(255,255,255,.25) 27px 29px,transparent 31px 46px)}
.hero .inner{position:relative;z-index:2;padding-top:78px}
.eyebrow{font-weight:900;font-size:14px;letter-spacing:.22em;color:#bcebf3}
.hero h1{font-size:clamp(42px,6vw,76px);line-height:1.05;letter-spacing:-.055em;margin:14px 0 20px}
.hero h1 em{font-style:normal;color:#89f0ef}
.hero p{font-size:18px;line-height:1.75;color:#e4f5f7;max-width:650px;margin:0}
.search-box{margin-top:22px;width:min(680px,100%);height:64px;border-radius:18px;background:#fff;display:flex;align-items:center;padding:0 9px 0 22px;box-shadow:0 18px 42px rgba(0,28,45,.12)}
.search-box input{border:0;outline:0;flex:1;min-width:0;font-size:16px;color:#22323d}
.search-box button{height:48px;border:0;border-radius:14px;padding:0 23px;background:var(--orange);color:#fff;font-weight:900}
.keywords{margin-top:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:13px}
.keywords button{border:1px solid rgba(255,255,255,.32);background:rgba(255,255,255,.11);border-radius:999px;padding:7px 11px;color:#fff}
.hero-card{position:absolute;right:25px;top:75px;width:305px;height:360px;background:linear-gradient(160deg,rgba(255,255,255,.96),rgba(238,251,253,.86));border-radius:30px;color:var(--ink);padding:24px;transform:rotate(2deg);box-shadow:0 32px 55px rgba(0,34,53,.30)}
.hero-card .visual{height:190px;border-radius:22px;position:relative;overflow:hidden}
.hero-card .visual .hero-img{width:100%;height:100%;object-fit:cover;display:block}
.hero-card small{display:block;margin-top:19px;color:var(--blue);font-weight:900}
.hero-card h3{font-size:23px;margin:7px 0}
.hero-card p{font-size:13px;line-height:1.55;color:#6e7e89;margin:0}
.quick-wrap{position:relative;z-index:4;margin-top:-52px}
.quick{max-width:1120px;margin:auto;background:#fff;border-radius:24px;padding:24px 22px;display:grid;grid-template-columns:repeat(7,1fr);box-shadow:0 16px 45px rgba(24,62,84,.08)}
.quick button{border:0;background:none;display:flex;flex-direction:column;align-items:center;gap:9px;color:#43525e;font-size:13px;font-weight:800}
.quick .circle{width:56px;height:56px;border-radius:18px;background:var(--sky);display:grid;place-items:center;font-size:25px;transition:.18s}

.section{padding:84px 0}.section.alt{background:#f4f8fa}
.section-head{display:flex;justify-content:space-between;align-items:end;margin-bottom:28px}.section-label{color:var(--blue);font-size:12px;font-weight:900;letter-spacing:.18em}.section h2{font-size:34px;letter-spacing:-.045em;margin:8px 0 0;color:var(--navy)}.more{border:1px solid var(--line);background:#fff;border-radius:999px;padding:10px 16px;color:#49606f;font-weight:800}
.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.travel-card{border:1px solid var(--line);border-radius:22px;overflow:hidden;background:#fff;box-shadow:0 8px 26px rgba(16,47,66,.07);transition:.2s}
.thumb{height:220px;position:relative;overflow:hidden}
.thumb-img{width:100%;height:100%;object-fit:cover;display:block}
.thumb.one{background:linear-gradient(160deg,#97e1e7 0 45%,#238bab 46% 65%,#f5c46b 66%)}
.thumb.two{background:linear-gradient(145deg,#f9d19a,#fb8d66 42%,#294f68 43%)}
.thumb.three{background:linear-gradient(155deg,#a4d3ff,#3984c2 42%,#d9e4bd 43% 70%,#557b50 71%)}
.badge{position:absolute;left:15px;top:15px;background:#fff;color:var(--blue);padding:7px 10px;border-radius:999px;font-size:11px;font-weight:900}
.like{position:absolute;right:14px;top:14px;width:38px;height:38px;border-radius:50%;border:0;background:rgba(255,255,255,.9);font-size:17px}
.card-body{padding:19px}.card-body h3{font-size:20px;margin:0 0 9px}.card-body p{font-size:13px;color:var(--muted);line-height:1.55;margin:0}.meta{margin-top:16px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;color:#788791;font-size:12px}
.theme-grid{display:grid;grid-template-columns:1.35fr 1fr 1fr;grid-template-rows:190px 190px;gap:18px}
.theme{border-radius:24px;overflow:hidden;padding:24px;position:relative;color:#fff;background:#294d62}
.theme:first-child{grid-row:span 2;background:linear-gradient(145deg,#063a5e,#0c9bb2)}
.theme:nth-child(2){background:linear-gradient(135deg,#ff9563,#d64c49)}
.theme:nth-child(3){background:linear-gradient(135deg,#6d70bd,#444687)}
.theme:nth-child(4){background:linear-gradient(135deg,#56a76f,#276947)}
.theme:nth-child(5){background:linear-gradient(135deg,#d6a34b,#a46e20)}
.theme:after{content:"";position:absolute;width:150px;height:150px;border:28px solid rgba(255,255,255,.12);border-radius:50%;right:-48px;bottom:-68px}
.theme .num{font-size:12px;font-weight:900;color:rgba(255,255,255,.72)}.theme h3{font-size:24px;margin:18px 0 6px}
.festival{display:grid;grid-template-columns:1.2fr 1fr;gap:22px}.festival-main{min-height:320px;border-radius:28px;padding:36px;color:#fff;background:linear-gradient(125deg,#082f4f 0 55%,#0ea8b5);position:relative;overflow:hidden}.festival-main .date{display:inline-block;border:1px solid rgba(255,255,255,.35);border-radius:999px;padding:8px 13px;font-size:12px}
.festival-list{display:grid;gap:12px}.event{display:grid;grid-template-columns:72px 1fr auto;align-items:center;gap:16px;border:1px solid var(--line);border-radius:18px;padding:14px 16px;background:#fff}.event-date{height:64px;border-radius:14px;background:var(--sky);display:flex;flex-direction:column;justify-content:center;align-items:center;color:var(--blue);font-weight:900}.event-date strong{font-size:22px}.event h4{margin:0 0 6px;font-size:15px}.event p{margin:0;font-size:12px;color:var(--muted)}.arrow{color:#8ca0ad;font-size:20px}
.community{display:grid;grid-template-columns:1fr 1fr;gap:22px}.post-list,.notice{border:1px solid var(--line);border-radius:24px;background:#fff;padding:24px}.panel-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.panel-title h3{margin:0;font-size:21px;color:var(--navy)}.post{padding:15px 0;border-bottom:1px solid var(--line)}.post:last-child{border-bottom:0}.post strong{display:block;font-size:14px}.post span{display:block;margin-top:6px;font-size:12px;color:var(--muted)}.notice-row{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid var(--line);font-size:13px}.notice-row:last-child{border:0}.notice-row b{color:var(--blue)}
.footer{background:#072b47;color:#dbe8ef;padding:50px 0 36px}.footer .inner{display:flex;justify-content:space-between;gap:40px}.footer-brand{font-size:24px;font-weight:900}.footer p{font-size:12px;line-height:1.7;color:#9db4c2}.footer-links{display:flex;gap:20px;font-size:12px;font-weight:800}
@media(max-width:900px){.quick{grid-template-columns:repeat(4,1fr)}.theme-grid{grid-template-columns:1fr 1fr}.cards{grid-template-columns:repeat(2,1fr)}.hero-card{display:none}}
</style>
