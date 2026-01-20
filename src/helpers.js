export function goBack() {
	window.history.back()
}

export function formatSum(num, currency) {
	return new Intl.NumberFormat('sk', { style: 'currency', currency: currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 2 }).format(num).replace(',00', '')
}


export function formatDate(date, seconds = false) {
	let options = {	day: 'numeric',	month: 'numeric', year: 'numeric', hour: '2-digit',	minute: 'numeric' }
	if (seconds) options.second = 'numeric'

	return new Date(date).toLocaleString( 'sk-SK', options)
}

export function removeAccents(str) {
	if (!str) return ""

	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function getVSByTime() {
	const nowDate = new Date(),
		year = String(nowDate.getFullYear()).slice(-1),
		day = Math.floor((nowDate - new Date(nowDate.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24),
		hours = String(nowDate.getHours()).padStart(2, 0),
		mins = String(nowDate.getMinutes()).padStart(2, 0),
		secs = String(nowDate.getSeconds()).padStart(2, 0)

	return `${year}${day}${hours}${mins}${secs}`
}

export function getQRDate(tomorrow) {
	let currentDate = new Date()
	let minDate = currentDate.toISOString().split('T')[0]
	if (tomorrow) currentDate.setDate(currentDate.getDate() + 1)

	return { currentDate, minDate }
}

export const hasQRSupport = 'BarcodeDetector' in window