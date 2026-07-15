<template>
  <div class="calendar-page container">
    <div class="cal-header">
      <button @click="prevMonth">◀</button>
      <div class="month-title">{{ monthTitle }}</div>
      <button @click="nextMonth">▶</button>
    </div>

    <div class="calendar-grid">
      <div class="weekday" v-for="d in weekdays" :key="d">{{ d }}</div>
      <div
        v-for="cell in cells"
        :key="cell.key"
        class="day-cell"
        :class="{ other: cell.other }"
      >
        <div class="date-row">
          <span class="date">{{ cell.day }}</span>
          <span class="updated" v-if="cell.events && cell.events.length"
            >갱신: {{ latestUpdated(cell.events) }}</span
          >
        </div>
        <ul class="events-list">
          <li
            v-for="evt in cell.events"
            :key="evt.id"
            @click="selectEvent(evt)"
            :style="{ borderLeft: '4px solid ' + eventColor(evt.contentid) }"
          >
            <strong>{{ evt.title }}</strong>
            <div class="evt-meta">{{ evt.location }}</div>
          </li>
        </ul>
      </div>
    </div>

    <div v-if="selected" class="detail card">
      <h3>{{ selected.title }}</h3>
      <div><strong>일시:</strong> {{ selected.date }}</div>
      <div><strong>장소:</strong> {{ selected.location }}</div>
      <div><strong>갱신일:</strong> {{ selected.updated_at }}</div>
      <p>{{ selected.description }}</p>
      <button @click="selected = null">닫기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import festivalData from "../../docs/data/부산_축제공연행사.json";

// convert festivalData.items (with eventstartdate/eventenddate in YYYYMMDD) into flat events array
function expandFestivalItems(items) {
  if (!Array.isArray(items)) return [];
  const out = [];
  for (const it of items) {
    const start = it.eventstartdate || it.date || "";
    const end = it.eventenddate || start;
    if (!start) continue;
    // parse YYYYMMDD
    const sYear = parseInt(start.slice(0, 4));
    const sMon = parseInt(start.slice(4, 6)) - 1;
    const sDay = parseInt(start.slice(6, 8));
    const eYear = parseInt(end.slice(0, 4));
    const eMon = parseInt(end.slice(4, 6)) - 1;
    const eDay = parseInt(end.slice(6, 8));
    let cur = new Date(sYear, sMon, sDay);
    const last = new Date(eYear, eMon, eDay);
    while (cur <= last) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const d = String(cur.getDate()).padStart(2, "0");
      out.push({
        id: it.contentid + "_" + y + m + d,
        title: it.title || "",
        date: `${y}-${m}-${d}`,
        location: it.eventplace || it.eventplace || it.addr1 || "",
        description: it.program || it.playtime || "",
        contentid: it.contentid || "",
        updated_at: it.modifiedtime
          ? new Date(
              it.modifiedtime.slice(0, 4) +
                "-" +
                it.modifiedtime.slice(4, 6) +
                "-" +
                it.modifiedtime.slice(6, 8),
            ).toISOString()
          : it.modifiedtime || "",
      });
      cur.setDate(cur.getDate() + 1);
    }
  }
  return out;
}

const events = expandFestivalItems(festivalData.items);

// assign colors per event (grouped by contentid)
const eventIds = Array.from(new Set(events.map((e) => e.contentid || e.title)));
const palette = [
  '#e11d48', // red
  '#0ea5e9', // blue
  '#7c3aed', // purple
  '#16a34a', // green
  '#fb923c', // orange
  '#06b6d4', // teal
  '#db2777', // magenta/pink
  '#a16207', // brown
  '#1e3a8a', // navy
  '#84cc16', // lime
  '#f97316', // deep orange
  '#6d28d9', // violet
  '#ff66b3', // pink
  '#ff8a65', // coral
  '#f59e0b', // amber
  '#14b8a6', // turquoise
  '#c026d3', // fuchsia
  '#ef4444', // tomato
  '#0ea5e9', // sky
  '#10b981', // emerald
];
const eventColors = {};
eventIds.forEach((id, i) => {
  eventColors[id] = palette[i % palette.length];
});

function eventColor(id) {
  return eventColors[id] || "#0078d4";
}

const today = new Date();
const year = ref(today.getFullYear());
const month = ref(today.getMonth()); // 0-based
const selected = ref(null);

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

function firstDayOfMonth(y, m) {
  return new Date(y, m, 1).getDay();
}
function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

function formatYMD(y, m, d) {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

const monthTitle = computed(() => {
  const names = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];
  return `${year.value} ${names[month.value]}`;
});

function buildCells() {
  const firstDow = firstDayOfMonth(year.value, month.value);
  const dim = daysInMonth(year.value, month.value);
  const prevDim = daysInMonth(year.value, month.value - 1);
  const cells = [];
  // previous month's tail
  for (let i = firstDow - 1; i >= 0; i--) {
    const day = prevDim - i;
    const date = formatYMD(year.value, month.value - 1, day);
    cells.push({
      key: `p-${date}`,
      other: true,
      day,
      events: eventsForDate(date),
    });
  }
  // current month
  for (let d = 1; d <= dim; d++) {
    const date = formatYMD(year.value, month.value, d);
    cells.push({
      key: date,
      other: false,
      day: d,
      date,
      events: eventsForDate(date),
    });
  }
  // next month's head to fill to 7*n
  while (cells.length % 7 !== 0) {
    const day = cells.length - (firstDow + dim) + 1;
    const date = formatYMD(year.value, month.value + 1, day);
    cells.push({
      key: `n-${date}`,
      other: true,
      day,
      events: eventsForDate(date),
    });
  }
  return cells;
}

function eventsForDate(dateStr) {
  const list = events.filter((e) => e.date === dateStr);
  // sort by updated_at desc (갱신일 기준 배치)
  return list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
}

const cells = ref(buildCells());

function refresh() {
  cells.value = buildCells();
}

function prevMonth() {
  if (month.value === 0) {
    year.value--;
    month.value = 11;
  } else month.value--;
  refresh();
}
function nextMonth() {
  if (month.value === 11) {
    year.value++;
    month.value = 0;
  } else month.value++;
  refresh();
}

function selectEvent(evt) {
  selected.value = evt;
}

function latestUpdated(list) {
  if (!list || list.length === 0) return "";
  const d = new Date(list[0].updated_at);
  return d.toLocaleDateString();
}
</script>

<style scoped>
.cal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 12px 0;
}
.month-title {
  font-weight: 700;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}
.weekday {
  font-weight: 700;
  text-align: center;
  padding: 6px;
}
.day-cell {
  background: #fff;
  padding: 8px;
  border-radius: 6px;
  min-height: 80px;
}
.day-cell.other {
  opacity: 0.5;
}
.date-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.events-list {
  list-style: none;
  padding: 6px 0;
  margin: 0;
}
.events-list li {
  padding: 6px;
  border-radius: 4px;
  background: #f7f7f7;
  margin-bottom: 6px;
  cursor: pointer;
}
.detail.card {
  margin-top: 16px;
  padding: 12px;
}
.evt-meta {
  font-size: 0.85rem;
  color: #666;
}
</style>
