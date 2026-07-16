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
          <input class="map-search" v-model="query" placeholder="POI 이름으로 필터링" @keyup.enter="searchByQuery" />
          <button class="btn" @click="searchByQuery">검색</button>
          <button class="btn" @click="locateUser">내 위치로 이동</button>
        </div>
      </div>
      <!-- debug info removed for cleaner UI -->
    </div>

    <div class="map-wrap" :class="{ 'search-active': searchActive }">
      <div ref="mapEl" class="map-container"></div>
      <aside class="results-panel" v-if="searchActive">
        <div class="results-header"><strong>검색 결과</strong><button class="btn-sm" @click="clearSearch">닫기</button></div>
        <ul class="results-list">
          <li v-for="(r,i) in searchResults" :key="i" class="result-item" @click="openSearchResult(r)">
            <div class="r-title">{{ r.name }}</div>
            <div class="r-sub">{{ r.category }} · {{ r.description }}</div>
          </li>
        </ul>
      </aside>
      <aside class="poi-panel" v-if="selectedPoi">
        <div class="poi-media">
          <img v-if="selectedPoi.image" :src="selectedPoi.image" alt="" />
          <div v-else class="no-image">이미지 없음</div>
        </div>
        <div class="poi-info">
          <h4>{{ selectedPoi.name }}</h4>
          <p>{{ selectedPoi.description }}</p>
          <div class="poi-actions"><button class="btn" @click="selectedPoi=null">닫기</button></div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, watchEffect } from "vue";
import { useRoute } from 'vue-router'
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
        image: it.firstimage || it.firstimage2 || it.image || "",
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
        image: it.firstimage || it.firstimage2 || it.image || "",
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

// Validate coordinates — many data sources mix lat/lng or use swapped fields.
// If coordinates look outside Korea but swapping them yields plausible coords, swap them.
function fixPoiCoords(list){
  return list.map(p=>{
    let lat = Number(p.latitude)
    let lng = Number(p.longitude)
    const inKorea = (la,ln)=> (la>=33 && la<=43 && ln>=124 && ln<=132)
    if(isNaN(lat) || isNaN(lng)) return { ...p, valid:false }
    if(inKorea(lat,lng)) return { ...p, valid:true }
    // try swap
    if(inKorea(lng,lat)){
      return { ...p, latitude: lng, longitude: lat, valid:true }
    }
    // not plausible coordinates for Korea — mark invalid so renderer can skip
    return { ...p, valid:false }
  })
}

const fixedPois = fixPoiCoords(pois)

// Names to hide from the app (user-requested)
const hiddenNames = new Set([
  "주식회사 놀핏",
  "보수동 책방골목",
  "구상반려암 (부산 국가지질공원)",
])

// Apply blacklist to produce the POIs actually used in rendering/searching
const filteredPois = fixedPois.filter(p => !hiddenNames.has(p.name))

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
const selectedPoi = ref(null)

const route = useRoute()

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
const searchResults = ref([])
const searchActive = ref(false)
let userMarker = null;
let userCircle = null;

function clearMarkers() {
  Object.values(layerGroups).forEach((lg) => lg.clearLayers());
}

function renderMarkers() {
  clearMarkers();
  const q = (query.value || "").toLowerCase().trim();
  filteredPois.forEach((p) => {
    if(!p.valid) return;
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
    marker.on('click', ()=> handleMarkerClick(p))
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

  // clicking on the map background should close the search results panel
  map.on('click', () => {
    clearSearch()
  })

  // if a category was passed via query, apply filter and zoom
  const qcat = route.query.category
  if(qcat){
    // set visible only for requested category if present
    const cat = String(qcat)
    let found = false
    categories.forEach(c=>{
      if(c.key === cat){ visible[c.key] = true; found = true } else { visible[c.key] = false }
    })
    if(found){
      // show results for that category and fit bounds
      const matches = filteredPois.filter(p => p.category === cat && p.valid)
      if(matches.length && map){
        searchResults.value = matches
        searchActive.value = true
        const latlngs = matches.map(m=> [m.latitude, m.longitude])
        const bounds = L.latLngBounds(latlngs)
        map.fitBounds(bounds, { padding: [60,60] })
      }
    }
  }

  // if a theme was passed via query, apply it as a text filter and center on a matching POI
  const qtheme = route.query.theme
  if(qtheme){
    query.value = String(qtheme)
    const t = String(qtheme).toLowerCase()
    // set query and run search to show panel of matching POIs
    // call searchByQuery() to populate searchResults
    searchByQuery()
  }

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

function handleMarkerClick(p){
  selectedPoi.value = p
  // close search panel when selecting a marker
  clearSearch()
  if(map){
    map.setView([p.latitude, p.longitude], 14)
  }
}

function searchByQuery(){
  const qRaw = (query.value||'').trim()
  const q = qRaw.toLowerCase()
  if(!q){
    // empty query: deactivate search panel and focus map on selected categories
    searchActive.value = false
    searchResults.value = []
    const selectedCategories = categories.filter(c => visible[c.key]).map(c => c.key)
    const matches = filteredPois.filter(p => p.valid && selectedCategories.includes(p.category))
    if(!matches || matches.length === 0){
      alert('선택된 카테고리에 해당하는 장소가 없습니다.')
      return
    }
    if(map){
      const latlngs = matches.map(m=> [m.latitude, m.longitude])
      const bounds = L.latLngBounds(latlngs)
      map.fitBounds(bounds, { padding: [60,60] })
    }
    return
  }
  // helper normalize: remove spaces and punctuation for stronger matching
  function normalize(s){
    return (s||'').toLowerCase().replace(/\s+/g,'').replace(/[^\p{L}\p{N}]/gu,'')
  }
  const nq = normalize(qRaw)
  // collect candidates
  const candidates = filteredPois.filter(p=>{
    if(!p.valid) return false
    const n = normalize(p.name)
    const d = normalize(p.description)
    return n.includes(nq) || d.includes(nq)
  })
  // ranking: exact normalized match, startsWith, includes
  const exact = candidates.find(p=> normalize(p.name) === nq)
  let matches = []
  if(exact) matches = [exact]
  else {
    const starts = candidates.filter(p=> normalize(p.name).startsWith(nq))
    const includes = candidates.filter(p=> normalize(p.name).includes(nq) && !normalize(p.name).startsWith(nq))
    const descIncludes = candidates.filter(p=> normalize(p.description).includes(nq) && !normalize(p.name).includes(nq))
    matches = [...starts, ...includes, ...descIncludes]
  }
  if(!matches || matches.length===0){
    alert('검색 결과가 없습니다.')
    searchActive.value = false
    searchResults.value = []
    return
  }
  // set search results and show panel
  searchResults.value = matches
  searchActive.value = true
  console.log('search matches:', matches.map(m=>({name:m.name,lat:m.latitude,lng:m.longitude})))
  if(map){
    // fit bounds to all matches
    const latlngs = matches.map(m=> [m.latitude, m.longitude])
    const bounds = L.latLngBounds(latlngs)
    map.fitBounds(bounds, { padding: [60,60] })
    // open popup on first match
    const first = matches[0]
    L.popup({maxWidth:300})
      .setLatLng([first.latitude, first.longitude])
      .setContent(`<strong>${first.name}</strong><br/>${first.description || ''}`)
      .openOn(map)
  }
}

function openSearchResult(p){
  selectedPoi.value = p
  if(map){
    map.setView([p.latitude, p.longitude], 14)
    L.popup({maxWidth:300}).setLatLng([p.latitude, p.longitude]).setContent(`<strong>${p.name}</strong><br/>${p.description || ''}`).openOn(map)
  }
}

function clearSearch(){
  searchActive.value = false
  searchResults.value = []
  query.value = ''
}
</script>

<style scoped>
.map-container {
  height: 70vh;
  margin: 16px 0;
}
.controls {
  padding: 12px;
  color: var(--text-primary);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  display: flex;

/* debug styles removed */
  align-items: center;
  gap: 6px;
  background: #fff;
  padding: 6px 10px;
  border-radius: 20px;
  border: 1px solid #eee;
}

.map-search{height:42px;border-radius:22px;padding:6px 14px;border:1px solid #e6eef2;min-width:220px}
.control-actions .btn{margin-left:8px}
.btn-sm{background:#fff;border:1px solid #e6eef2;border-radius:8px;padding:6px 8px}

.map-wrap{
  display:flex;
  gap:14px;
  align-items:flex-start;
  max-width:1200px; /* keep content from stretching edge-to-edge */
  margin:0 auto; /* center the map area */
  padding:0 20px; /* breathing room on left/right */
  box-sizing:border-box;
}
.map-container{flex:1 1 100%;min-width:0;transition:all .22s ease}
.map-wrap.search-active .map-container{flex:0 0 66%}
.results-panel,.poi-panel{flex:0 0 34%;background:#fff;border-radius:12px;padding:12px;box-shadow:0 8px 30px rgba(0,0,0,0.08)}
.results-panel{display:flex;flex-direction:column;max-height:70vh;overflow:auto}
.results-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.results-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.result-item{padding:10px;border-radius:10px;border:1px solid #f0f4f6;cursor:pointer}
.result-item:hover{background:#f6fbfd}
.r-title{font-weight:800}
.r-sub{font-size:13px;color:var(--text-secondary)}
.poi-media{height:280px;overflow:hidden;border-radius:8px;background:#f4f4f4;display:flex;align-items:center;justify-content:center}
.poi-media img{width:100%;height:100%;object-fit:cover;display:block}
.poi-info h4{margin:10px 0 6px}
.poi-info p{color:var(--text-secondary);font-size:14px}
.poi-actions{margin-top:12px}
</style>
