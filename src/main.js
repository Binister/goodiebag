import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

document.addEventListener(
  'touchmove',
  (e) => {
    if (e.target.closest('input, .frequency-slider')) return
    e.preventDefault()
  },
  { passive: false }
)

createApp(App).mount('#app')
