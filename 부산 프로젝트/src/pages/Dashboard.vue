<template>
  <div class="dashboard container">
    <h2>대시보드</h2>

    <section class="summary-cards">
      <div class="card">
        <h4>총 게시물</h4>
        <div class="value">{{ data.community.total_posts }}</div>
      </div>
      <div class="card">
        <h4>활성 사용자</h4>
        <div class="value">{{ data.community.active_users }}</div>
      </div>
    </section>

    <section class="charts">
      <div class="chart-controls">
        <label>기간: </label>
        <select v-model="startMonth">
          <option value="">전체</option>
          <option v-for="m in months" :key="m" :value="m">{{ m }}</option>
        </select>
        <span>~</span>
        <select v-model="endMonth">
          <option value="">전체</option>
          <option v-for="m in months" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
      <div class="chart-card">
        <h4>카테고리별 방문수</h4>
        <canvas ref="barChart"></canvas>
      </div>
      <div class="chart-card">
        <h4>월별 게시물 수</h4>
        <canvas ref="lineChart"></canvas>
      </div>
    </section>

    <section class="table card">
      <h4>최근 커뮤니티 지표(샘플)</h4>
      <table>
        <thead>
          <tr>
            <th>지표</th>
            <th>값</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>총 게시물</td>
            <td>{{ data.community.total_posts }}</td>
          </tr>
          <tr>
            <td>활성 사용자</td>
            <td>{{ data.community.active_users }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import Chart from "chart.js/auto";
import dataJson from "../../docs/data/dashboard.json";

const data = dataJson;
const barChart = ref(null);
const lineChart = ref(null);
let barInstance = null;
let lineInstance = null;
const startMonth = ref("");
const endMonth = ref("");

const months = data.community.posts_per_month.map((p) => p.month);

function getFilteredPosts() {
  const list = data.community.posts_per_month;
  if (!startMonth.value && !endMonth.value) return list;
  const start = startMonth.value || list[0].month;
  const end = endMonth.value || list[list.length - 1].month;
  const sIdx = list.findIndex((p) => p.month === start);
  const eIdx = list.findIndex((p) => p.month === end);
  if (sIdx === -1 || eIdx === -1) return list;
  const from = Math.min(sIdx, eIdx);
  const to = Math.max(sIdx, eIdx);
  return list.slice(from, to + 1);
}

onMounted(() => {
  // bar chart for visits_by_category
  const ctxBar = barChart.value.getContext("2d");
  const categories = Object.keys(data.tourism.visits_by_category);
  const values = Object.values(data.tourism.visits_by_category);
  barInstance = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: categories,
      datasets: [{ label: "방문수", data: values, backgroundColor: "#0078d4" }],
    },
    options: { responsive: true },
  });

  // line chart for posts_per_month
  const ctxLine = lineChart.value.getContext("2d");
  const initialMonths = data.community.posts_per_month.map((p) => p.month);
  const initialCounts = data.community.posts_per_month.map((p) => p.count);
  lineInstance = new Chart(ctxLine, {
    type: "line",
    data: {
      labels: initialMonths,
      datasets: [
        {
          label: "게시물 수",
          data: initialCounts,
          borderColor: "#ff7b00",
          fill: false,
        },
      ],
    },
    options: { responsive: true },
  });

  // watch filters and update line chart
  const updateLine = () => {
    const filtered = getFilteredPosts();
    const labels = filtered.map((p) => p.month);
    const values = filtered.map((p) => p.count);
    if (lineInstance) {
      lineInstance.data.labels = labels;
      lineInstance.data.datasets[0].data = values;
      lineInstance.update();
    }
  };

  watch([startMonth, endMonth], updateLine);
});
</script>

<style scoped>
.container {
  padding: 24px;
}
.summary-cards {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.card {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 8px;
}
.charts {
  display: flex;
  gap: 12px;
}
.chart-card {
  flex: 1;
  background: #fff;
  padding: 12px;
  border-radius: 8px;
}
.table {
  margin-top: 16px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 8px;
  border-bottom: 1px solid #eee;
  text-align: left;
}
</style>
