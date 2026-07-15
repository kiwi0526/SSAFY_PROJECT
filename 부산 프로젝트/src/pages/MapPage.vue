<template>
  <div class="map-page">
    <div class="controls container">
      <div class="controls-top">
        <div>
          <h3>카테고리</h3>
          <div class="chips">
            <label
              v-for="c in categories"
              :key="c.key"
              class="chip"
              :style="{ borderColor: categoryColors[c.key], background: visible[c.key] ? (categoryColors[c.key] + '22') : '#fff' }"
            >
              <input type="checkbox" v-model="visible[c.key]" :style="{ accentColor: categoryColors[c.key] }" />
              <span>{{ c.label }}</span>
            </label>
          </div>
        </div>

        <div class="control-actions">
          <input v-model="query" placeholder="POI 이름으로 필터링" />
          <button class="btn" @click="locateUser">내 위치로 이동</button>
        </div>
      </div>
      <div class="debug container">
        <small>POI count: {{ pois.length }}</small>
        <div class="debug-list">
          <span v-for="(p,i) in pois.slice(0,6)" :key="i" class="dbg">{{ p.name }}{{ i<5?',' : '' }}</span>
        </div>
      </div>
    </div>

    <div ref="mapEl" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, watchEffect } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import tour from "../../docs/data/부산_관광지.json";
import leports from "../../docs/data/부산_레포츠.json";
import culture from "../../docs/data/부산_문화시설.json";
import shopping from "../../docs/data/부산_쇼핑.json";
import lodging from "../../docs/data/부산_숙박.json";
import course from "../../docs/data/부산_여행코스.json";
import festival from "../../docs/data/부산_축제공연행사.json";
import extraPois from "../../docs/data/pois.json";

// helper to normalize various data shapes into { name, latitude, longitude, description, category }
function normalizeItems(data, categoryLabel) {
  if (!data) return [];
  // if VisitKorea API style with .items array
  if (Array.isArray(data.items)) {
    return data.items
      .map((it) => ({
        name: it.title || it.name || it.addr1 || "",
        latitude: parseFloat(it.mapy || it.latitude || it.lat || NaN),
        longitude: parseFloat(it.mapx || it.longitude || it.lng || NaN),
        description: it.addr1 || it.description || it.tel || "",
        category: categoryLabel,
      }))
      .filter((p) => !isNaN(p.latitude) && !isNaN(p.longitude));
  }
  // if already an array of POIs
  if (Array.isArray(data)) {
    return data
      .map((it) => ({
        name: it.name || it.title || "",
        latitude: parseFloat(it.latitude || it.mapy || it.lat || NaN),
        longitude: parseFloat(it.longitude || it.mapx || it.lng || NaN),
        description: it.description || it.addr1 || "",
        category: categoryLabel || it.category || "",
      }))
      .filter((p) => !isNaN(p.latitude) && !isNaN(p.longitude));
  }
  // unknown shape
  return [];
}

const raw = [
  ...normalizeItems(tour, "관광지"),
  ...normalizeItems(leports, "레포츠"),
  ...normalizeItems(culture, "문화시설"),
  ...normalizeItems(shopping, "쇼핑"),
  ...normalizeItems(lodging, "숙박"),
  ...normalizeItems(course, "여행코스"),
  ...normalizeItems(festival, "축제공연행사"),
  ...normalizeItems(extraPois, ""),
];

const pois = raw.map((p) => ({ ...p, category: p.category || "기타" }));

// Fix default icon paths for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const mapEl = ref(null);
let map = null;
const layerGroups = {};

// derive categories dynamically from data
const uniqueCats = Array.from(new Set(pois.map((p) => p.category || "기타")));
const categories = uniqueCats.map((k) => ({ key: k, label: k }));

// assign colors per category
const palette = [
  "#0078d4",
  "#00a6d6",
  "#00c2a8",
  "#ff7b00",
  "#ff4d6d",
  "#8b5cf6",
  "#f59e0b",
  "#06b6d4",
];
const categoryColors = {};
uniqueCats.forEach((k, i) => (categoryColors[k] = palette[i % palette.length]));

const visible = reactive({});
categories.forEach((c) => (visible[c.key] = true));

const query = ref("");
let userMarker = null;
let userCircle = null;

function clearMarkers() {
  Object.values(layerGroups).forEach((lg) => lg.clearLayers());
}

function renderMarkers() {
  clearMarkers();
  const q = (query.value || "").toLowerCase().trim();
  pois.forEach((p) => {
    if (!visible[p.category]) return;
    if (
      q &&
      !(
        String(p.name || "")
          .toLowerCase()
          .includes(q) ||
        String(p.description || "")
          .toLowerCase()
          .includes(q)
      )
    )
      return;
    const lg = layerGroups[p.category];
    if (!lg) return;
    const color = categoryColors[p.category] || "#0078d4";
    const marker = L.circleMarker([p.latitude, p.longitude], {
      radius: 8,
      color,
      fillColor: color,
      fillOpacity: 0.9,
    });
    marker.bindPopup(`<strong>${p.name}</strong><br/>${p.description || ""}`);
    marker.addTo(lg);
  });
}

onMounted(() => {
  map = L.map(mapEl.value).setView([35.1796, 129.0756], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  // create empty layer groups per category
  categories.forEach((cat) => {
    const lg = L.layerGroup().addTo(map);
    layerGroups[cat.key] = lg;
  });

  // initial render
  console.log('Map POIs loaded:', pois.length, 'categories:', categories, categoryColors)
  renderMarkers();

  // reactive watcher to re-render when filters change
  watchEffect(() => {
    // read reactive deps
    const _ = query.value;
    categories.forEach((c) => visible[c.key]);
    renderMarkers();
  });

  onBeforeUnmount(() => {
    if (map) map.remove();
  });
});

function locateUser() {
  if (!map) return;
  if (!navigator.geolocation) {
    alert("Geolocation을 지원하지 않는 브라우저입니다.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      if (userMarker) {
        map.removeLayer(userMarker);
      }
      if (userCircle) {
        map.removeLayer(userCircle);
      }
      userMarker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup("내 위치")
        .openPopup();
      userCircle = L.circle([lat, lon], {
        radius: Math.max(50, pos.coords.accuracy || 50),
      }).addTo(map);
      map.setView([lat, lon], 14);
    },
    (err) => {
      alert("위치 정보를 가져올 수 없습니다: " + err.message);
    },
  );
}
</script>

<style scoped>
.map-container {
  height: 70vh;
  margin: 16px 0;
}
.controls {
  padding: 12px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  display: flex;

.debug{margin-top:8px}
.dbg{display:inline-block;margin-right:6px;background:#eef;padding:4px 6px;border-radius:4px}
  align-items: center;
  gap: 6px;
  background: #fff;
  padding: 6px 10px;
  border-radius: 20px;
  border: 1px solid #eee;
}
</style>
