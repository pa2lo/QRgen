import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

if (localStorage.getItem('b-appearance')) {
	let appearance = JSON.parse(localStorage.getItem('b-appearance'))
	if (appearance == 'dark') document.documentElement.classList.add('theme-dark')
	else if (appearance == 'light') document.documentElement.classList.add('theme-light')

	document.querySelector('meta[name="theme-color"]')?.setAttribute('content', appearance == 'dark' ? '#0A0A0A' : '#FFFFFF')
} else document.querySelector('meta[name="theme-color"]')?.setAttribute('content', window.matchMedia('(prefers-color-scheme: dark)').matches ? '#0A0A0A' : '#FFFFFF')

createApp(App).mount('#app')
