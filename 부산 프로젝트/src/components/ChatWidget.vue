<template>
  <div>
    <button
      v-if="!open"
      class="chat-toggle-button"
      @click="toggle"
      aria-label="챗봇 열기"
    >
      🤖
    </button>

    <div class="chat-widget" v-show="open">
      <div class="chat-header">
        <span>LocalHub 챗봇</span>
        <button class="close" @click="toggle">×</button>
      </div>

      <div class="chat-body">
        <div class="messages">
          <div v-for="(m, i) in messages" :key="i" :class="['msg', m.from]">
            <template v-if="m.from === 'bot'">
              <div class="text" v-html="m.html || m.text"></div>
            </template>
            <template v-else>
              <div class="text">{{ m.text }}</div>
            </template>
          </div>
        </div>
        <div
          v-if="showWarning"
          class="warning"
          style="
            padding: 8px;
            color: #b45309;
            background: #fff7ed;
            border-top: 1px solid #fde3cf;
          "
        >
          추가 질문이 없으면 {{ countdownSeconds }}초 뒤 종료됩니다
        </div>

        <form @submit.prevent="send" class="chat-input">
          <input
            v-model="input"
            placeholder="무엇을 도와드릴까요? 예: 축제 알려줘"
          />
          <button type="submit">전송</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import festivalData from "../../docs/data/부산_축제공연행사.json";
import tourData from "../../docs/data/부산_관광지.json";

const open = ref(false);
const input = ref("");
const messages = ref([]);

// inactivity timers
let inactivityTimer = null;
let countdownTimer = null;
const showWarning = ref(false);
const countdownSeconds = ref(30);

const STORAGE_KEY = "localhub_chat_messages";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) messages.value = JSON.parse(raw);
  } catch (e) {}
}
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value));
}

onMounted(load);

function toggle() {
  open.value = !open.value;
}

function botReply(text) {
  const t = text.toLowerCase();
  // check festival titles
  const festivalMatch = findFestivalMatch(t);
  if (festivalMatch) return festivalMatch;
  // check tourist places
  const placeMatch = findPlaceMatch(t);
  if (placeMatch) return placeMatch;
  if (t.includes("축제") || t.includes("페스티벌"))
    return { html: `<div class="bot-title">부산 축제</div><div class="bot-sub">캘린더에서 자세한 일정을 확인하세요. (메뉴: 축제 캘린더)</div>`, text: '부산 축제은 캘린더에서 확인' };
  if (t.includes("지도") || t.includes("위치"))
    return { html: `<div class="bot-title">지도 안내</div><div class="bot-sub">지도를 열어 카테고리별 POI를 확인할 수 있습니다. (메뉴: 지도)</div>`, text: '지도를 열어 POI 확인' };
  if (t.includes("게시판") || t.includes("글"))
    return { html: `<div class="bot-title">게시판 안내</div><div class="bot-sub">부산 게시판에서 글을 작성하거나 읽을 수 있습니다. (메뉴: 부산 게시판)</div>`, text: '게시판 안내' };
  if (t.includes("대시보드") || t.includes("통계"))
    return { html: `<div class="bot-title">대시보드</div><div class="bot-sub">대시보드에서 관광/커뮤니티 통계를 확인하세요. (메뉴: 대시보드)</div>`, text: '대시보드 안내' };
  return { html: `<div class="bot-title">죄송해요</div><div class="bot-sub">이해하지 못했습니다. 간단하게 <code>축제</code>, <code>지도</code>, <code>게시판</code> 등을 물어보세요.</div>`, text: '이해하지 못했습니다' };
}

function formatDateYmd(ymd) {
  if (!ymd || String(ymd).length !== 8) return ymd;
  const y = ymd.slice(0, 4),
    m = ymd.slice(4, 6),
    d = ymd.slice(6, 8);
  return `${y}-${m}-${d}`;
}

function findFestivalMatch(text) {
  if (!festivalData || !Array.isArray(festivalData.items)) return null;
  const toks = text.split(/\s+/).filter(Boolean);
  for (const it of festivalData.items) {
    const title = (it.title || "").toLowerCase();
    if (toks.some((tok) => title.includes(tok))) {
      const start = it.eventstartdate || "";
      const end = it.eventenddate || start;
      const html = `<div class="bot-title">${it.title}</div><div class="bot-sub">기간: ${formatDateYmd(start)} ~ ${formatDateYmd(end)}</div><div class="bot-sub">장소: ${it.eventplace || it.addr1 || '정보 없음'}</div>`;
      return { html, text: `${it.title} 기간: ${formatDateYmd(start)} ~ ${formatDateYmd(end)}` };
    }
  }
  // if user asked '축제' list upcoming few
  if (text.includes("축제") || text.includes("페스티벌")) {
    const previewItems = festivalData.items.slice(0, 5);
    const listHtml = previewItems
      .map((it) => `<li><strong>${it.title}</strong> — ${formatDateYmd(it.eventstartdate)}</li>`)
      .join("");
    const html = `<div class="bot-title">대표 축제 예시</div><ul class="bot-list">${listHtml}</ul>`;
    return { html, text: '대표 축제 예시' };
  }
  return null;
}

function findPlaceMatch(text) {
  if (!tourData) return null;
  const items = Array.isArray(tourData.items) ? tourData.items : [];
  const toks = text.split(/\s+/).filter(Boolean);
  for (const it of items) {
    const name = (it.title || it.addr1 || "").toLowerCase();
    if (toks.some((tok) => name.includes(tok))) {
      const coord = `${it.mapy || it.mapx ? (it.mapy || it.latitude) + "," + (it.mapx || it.longitude) : ""}`;
      const html = `<div class="bot-title">${it.title}</div><div class="bot-sub">주소: ${it.addr1 || ''} ${it.addr2 || ''}</div>${coord ? `<div class="bot-sub">좌표: ${coord}</div>` : ''}`;
      return { html, text: it.title };
    }
  }
  return null;
}

function send() {
  if (!input.value.trim()) return;
  messages.value.push({ from: "user", text: input.value });
  const reply = botReply(input.value);
  setTimeout(() => {
    if (reply && typeof reply === 'object' && reply.html) {
      messages.value.push({ from: 'bot', text: reply.text || '', html: reply.html });
    } else {
      messages.value.push({ from: 'bot', text: reply });
    }
    persist();
  }, 300);
  input.value = "";
  persist();
  resetInactivityTimers();
}

function resetInactivityTimers() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  showWarning.value = false;
  countdownSeconds.value = 30;
  inactivityTimer = setTimeout(() => {
    showWarning.value = true;
    countdownSeconds.value = 30;
    countdownTimer = setInterval(() => {
      countdownSeconds.value -= 1;
      if (countdownSeconds.value <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        // clear chat and close
        messages.value = [];
        persist();
        open.value = false;
        showWarning.value = false;
      }
    }, 1000);
  }, 120000); // 2 minutes
}

function cancelInactivityTimers() {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  showWarning.value = false;
  countdownSeconds.value = 30;
}

import { onBeforeUnmount } from "vue";
onBeforeUnmount(() => {
  cancelInactivityTimers();
});
</script>

<style scoped>
.chat-widget {
  position: fixed;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  width: 320px;
  font-family: Arial;
  z-index: 9999;
}

.chat-toggle-button {
  position: fixed;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(180deg, #ffd6e0, #ff9ec2);
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  z-index: 10000;
}
.chat-header {
  background: #0078d4;
  color: #fff;
  padding: 8px;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}
.chat-body {
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 0 0 8px 8px;
  max-height: 420px;
  display: flex;
  flex-direction: column;
}
.messages {
  padding: 8px;
  overflow: auto;
  flex: 1;
}
.msg {
  margin-bottom: 8px;
}
.msg.user {
  text-align: right;
}
.msg.bot {
  text-align: left;
}
.msg .text {
  display: inline-block;
  padding: 8px;
  border-radius: 8px;
  background: #f1f5f9;
}
.msg.user .text {
  background: #0078d4;
  color: #fff;
}
.bot-title{font-weight:900;margin-bottom:6px;color:#053b5a}
.bot-sub{font-size:13px;color:#234e63;margin-bottom:6px}
.bot-list{margin:8px 0 0 16px;padding:0}
.bot-list li{margin-bottom:6px}
.chat-input {
  display: flex;
  padding: 8px;
  border-top: 1px solid #eee;
}
.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.chat-input button {
  margin-left: 8px;
  padding: 8px 10px;
  border: none;
  background: #0078d4;
  color: #fff;
  border-radius: 6px;
}
.close {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 18px;
}
</style>
