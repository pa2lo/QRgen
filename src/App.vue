<script setup>
import { ref, onBeforeMount, onMounted, watch } from 'vue'
import { IconSettings, IconSettingsFilled, IconDashboard, IconDashboardFilled, IconScan, IconInfoCircle, IconInfoCircleFilled } from '@tabler/icons-vue'
import { appearance, installPrompt } from './store'
import { hasQRSupport } from './helpers'
import { t } from './lang/labels'

import HistoryPage from './pages/HistoryPage.vue'
import SettingsPage from './pages/SettingsPage.vue'
import AddAccount from './pages/AddAccount.vue'
import EditAccount from './pages/EditAccount.vue'
import NewQR from './pages/NewQR.vue'
import DuplicateQR from './pages/DuplicateQR.vue'
import QRShow from './pages/QRShow.vue'
import QRScanner from './pages/QRScanner.vue'
import SetTip from './pages/SetTip.vue'
import AboutPage from './pages/AboutPage.vue'
import MenuLink from './components/MenuLink.vue'

const activePage = ref('history')

onBeforeMount(() =>{
	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault()
		installPrompt.value = e
	})
})

onMounted(() => {
	window.addEventListener('hashchange', (e) => {
		if (window.location.hash == '#settings') activePage.value = 'settings'
		else if (window.location.hash == '#about') activePage.value = 'about'
		else if (window.location.hash == '#addAccount') activePage.value = 'addAccount'
		else if (window.location.hash == '#scanQR') activePage.value = 'scanQR'
		else if (window.location.hash.startsWith('#editAccount')) activePage.value = 'editAccount'
		else if (window.location.hash.startsWith('#showQR')) activePage.value = 'showQR'
		else if (window.location.hash.startsWith('#setTip')) activePage.value = 'setTip'
		else if (window.location.hash == '#newQR') activePage.value = 'newQR'
		else if (window.location.hash.startsWith('#duplicateQR')) activePage.value = 'duplicateQR'
		else activePage.value = 'history'
	})
})

function visitLink(href) {
	if (href == 'history' && window.location.hash) window.history.back()
	else if (window.location.hash) {
		window.history.replaceState(null, null, `#${href}`)
		activePage.value = href.split('-')[0]
	} else window.location.hash = href
}

watch(appearance, (newVal) => {
	document.documentElement.classList.toggle('theme-dark', newVal == 'dark')
	document.documentElement.classList.toggle('theme-light', newVal == 'light')

	document.querySelector('meta[name="theme-color"]').setAttribute('content', newVal == 'dark' || (newVal == 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#0A0A0A' : '#FFFFFF')
})
</script>

<template>
	<div class="appCont">
		<Transition name="fade" mode="out-in">
			<AddAccount v-if="activePage == 'addAccount'" />
			<EditAccount v-else-if="activePage == 'editAccount'" />
			<NewQR v-else-if="activePage == 'newQR'" @save="visitLink" />
			<DuplicateQR v-else-if="activePage == 'duplicateQR'" @save="visitLink" />
			<QRShow v-else-if="activePage == 'showQR'" />
			<SetTip v-else-if="activePage == 'setTip'" @save="visitLink" />
			<div v-else class="pages-wrapper">
				<Transition name="fade" mode="out-in">
					<HistoryPage v-if="activePage == 'history'" />
					<SettingsPage v-else-if="activePage == 'settings'" />
					<QRScanner v-else-if="activePage == 'scanQR'" />
					<AboutPage v-else-if="activePage == 'about'" />
				</Transition>
				<div class="bottom-nav">
					<MenuLink :label="t('m1')" :icon="activePage == 'history' ? IconDashboardFilled : IconDashboard" :isActive="activePage == 'history'" @click="visitLink('history')" />
					<MenuLink v-if="hasQRSupport" :label="t('m4')" :icon="IconScan" :isActive="activePage == 'scanQR'" @click="visitLink('scanQR')" />
					<MenuLink :label="t('m3')" :icon="activePage == 'settings' ? IconSettingsFilled : IconSettings" :isActive="activePage == 'settings'" @click="visitLink('settings')" />
					<MenuLink :label="t('m5')" :icon="activePage == 'about' ? IconInfoCircleFilled : IconInfoCircle" :isActive="activePage == 'about'" @click="visitLink('about')" />
				</div>
			</div>
		</Transition>
	</div>
</template>