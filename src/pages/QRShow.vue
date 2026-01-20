<script setup>
import { onMounted, onBeforeMount, ref, toRaw } from 'vue'
import { qrHistory, settings } from '@/store'
import { IconCancel, IconDownload } from '@tabler/icons-vue'
import { encode as QRencode } from "bysquare"
import { goBack, formatSum } from '@/helpers'
import { generate } from 'lean-qr'
import { t } from '@/lang/labels'

import FullPage from '@/components/FullPage.vue'

const QRts = window.location.hash.split('-')[1]

const QRData = ref(qrHistory.value.find(qr => qr.ts == QRts))

const QRString = ref(null)
const QRError = ref(null)

onBeforeMount(() => {
	if (QRData.value.type == 'pbs') {
		try {
			QRString.value = QRencode({
				payments: [{
					type: 1,
					amount: QRData.value.amount,
					currencyCode: QRData.value.currencyCode,
					paymentDueDate: QRData.value.paymentDueDate,
					paymentNote: QRData.value.paymentNote,
					variableSymbol: QRData.value.variableSymbol,
					constantSymbol: QRData.value.constantSymbol,
					specificSymbol: QRData.value.specificSymbol,
					bankAccounts: [
						{ iban: QRData.value.iban, bic: QRData.value.bic }
					],
					beneficiary: {
						name: QRData.value.name
					}
				}]
			})
		} catch (error) {
			QRError.value = error.message
			buttonVisible.value = true
		}
	} else if (QRData.value.type == 'spd') {
		let QRStr = 'SPD*1.0'
		QRStr += `*ACC:${QRData.value.iban}`
		if (QRData.value.bic) QRStr += `+${QRData.value.bic}`
		QRStr += `*AM:${QRData.value.amount}`
		QRStr += `*CC:${QRData.value.currencyCode}`
		QRStr += `*RN:${QRData.value.name.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`
		QRStr += `*DT:${QRData.value.paymentDueDate.replaceAll('-', '')}`
		QRStr += `*PT:IP`
		if (QRData.value.paymentNote) QRStr += `*MSG:${QRData.value.paymentNote.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`
		if (QRData.value.variableSymbol) QRStr += `*X-VS:${QRData.value.variableSymbol}`
		if (QRData.value.specificSymbol) QRStr += `*X-SS:${QRData.value.specificSymbol}`
		if (QRData.value.constantSymbol) QRStr += `*X-KS:${QRData.value.constantSymbol}`
		QRString.value = QRStr
	}
})

let qrcode = null
const QRCanvas = ref(null)

const buttonVisible = ref(settings.value.qrbutton == 'visible')
let buttonTimeout = null
function setButtonVisibility() {
	if (!buttonVisible.value) buttonVisible.value = true
	if (buttonTimeout) clearTimeout(buttonTimeout)
}

function getColorArr(color) {
	return [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16), 255]
}

onMounted(() => {
	if (QRCanvas.value && QRString.value) {
		qrcode = generate(QRString.value)
		qrcode.toCanvas(QRCanvas.value, {
			on: getColorArr(settings.value.qrForeground),
			off: getColorArr(settings.value.qrBackground),
			pad: 2
		})

		if (settings.value.qrbutton == 'timeout') buttonTimeout = setTimeout(setButtonVisibility, 10000)
	} else if (!buttonVisible.value) buttonVisible.value = true
})

function downloadQR(force) {
	if (!settings.value.showQRDownload || (!force && !buttonVisible.value) || !qrcode || !QRString.value) return

	const dataURL = qrcode.toDataURL({
		type: 'image/png',
		on: getColorArr(settings.value.qrForeground),
		off: getColorArr(settings.value.qrBackground),
		scale: 8,
		pad: 2
	})

	let newLink = Object.assign(document.createElement('a'), {
		href: dataURL,
		download: `qr-${QRts}.png`
	})
	newLink.click()

	newLink = null
}
</script>

<template>
	<FullPage @click="setButtonVisibility" class="qr-page">
		<div v-if="!QRData || QRError" class="empty-cont">
			<IconCancel class="empty-cont-ico" />
			<h2>{{ t('qrna') }}</h2>
			<p v-if="QRError" class="qr-error">{{ QRError }}</p>
		</div>
		<div v-else class="empty-cont">
			<h1>{{ t('payqr') }}</h1>
			<div class="qr-canvas-wrapper" @click.prevent="downloadQR(false)" :class="{isClickable: buttonVisible && settings.showQRDownload}">
				<canvas ref="QRCanvas" class="qr-canvas"></canvas>
				<button class="qr-download" @click.stop="downloadQR(true)"><IconDownload /></button>
			</div>
			<h1>{{ formatSum(QRData.amount, QRData.currencyCode) }}</h1>
		</div>
		<template #footer>
			<Transition name="fade" mode="out-in">
				<button v-if="buttonVisible" class="button" @click="goBack">{{ t('back') }}</button>
				<span v-else class="button-spacer"></span>
			</Transition>
		</template>
	</FullPage>
</template>