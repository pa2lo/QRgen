import { ref } from "vue"
import { useStorage } from "./composables/BrowserStorage"
import { useRegisterSW } from 'virtual:pwa-register/vue'

export const accounts = useStorage('b-accounts', {})
export const appearance = useStorage('b-appearance', 'auto')
export const lang = useStorage('b-lang', 'sk')
export const settings = useStorage('b-settings', {
	qrbutton: 'onclick',
	showQRDownload: true,
	defaultAcc: '',
	qrBackground: '#ffffff',
	qrForeground: '#045fa1',
	roundTip: false
})
export const qrHistory = useStorage('b-history', [])
export const qrFilter = useStorage('b-filter', {
	accId: '',
	currencyCode: '',
	dateFrom: '',
	dateFromTS: '',
	dateTo: '',
	dateToTS: '',
	amountFrom: '',
	amountTo: '',
	tipsOnly: false
})

/* lists */
export const currencySymbolsMap = {
	EUR: '€',
	CZK: 'Kč',
	USD: '$'
}
export const currencyOptions = [{val: 'EUR', title: '€'}, {val: 'CZK', title: 'Kč'}, {val: 'USD', title: '$'}]
export const typeOptions = [{val: 'pbs', title: 'PAY by square (SK)'}, {val: 'spd', title: 'SPD (CZ)'}]
export const dateOptions = [{val: 'today', title: 'Dnes'}, {val: 'tomorrow', title: 'Zajtra'}]
export const accTypesMap = {
	pbs: 'PAY by square (SK)',
	spd: 'SPD (CZ)'
}

/* PWA */
export const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW()
export let installPromptClosed = ref(localStorage.getItem('installClosed'))
export let installPrompt = ref(null)
export function closeInstall() {
	installPromptClosed.value = 1
	localStorage.setItem('installClosed', 1)
}
export function installApp() {
	if (!installPrompt.value) return

	installPrompt.value.prompt()
	installPrompt.value.userChoice.then(result => {
		if (result.outcome === 'accepted') installPrompt.value = null
	})
}