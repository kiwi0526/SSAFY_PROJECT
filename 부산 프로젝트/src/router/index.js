import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Board from '../pages/Board.vue'
import MapPage from '../pages/MapPage.vue'
import Calendar from '../pages/Calendar.vue'
import Bookmarks from '../pages/Bookmarks.vue'
import Detail from '../pages/Detail.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/board', name: 'Board', component: Board },
  { path: '/map', name: 'Map', component: MapPage },
  { path: '/calendar', name: 'Calendar', component: Calendar },
  { path: '/bookmarks', name: 'Bookmarks', component: Bookmarks },
  { path: '/detail/:slug', name: 'Detail', component: Detail },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
