import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Board from '../pages/Board.vue'
import MapPage from '../pages/MapPage.vue'
import Dashboard from '../pages/Dashboard.vue'
import Calendar from '../pages/Calendar.vue'
import Bookmarks from '../pages/Bookmarks.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/board', name: 'Board', component: Board },
  { path: '/map', name: 'Map', component: MapPage },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/calendar', name: 'Calendar', component: Calendar },
  { path: '/bookmarks', name: 'Bookmarks', component: Bookmarks },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
