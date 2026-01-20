<script setup>
import { onBeforeMount, onBeforeUnmount, ref } from 'vue'
import { IconUpload, IconCancel } from '@tabler/icons-vue'
import { decode as QRdecode } from "bysquare"
import { hasQRSupport } from '@/helpers'
import { t } from '@/lang/labels'
import { isIBAN, isBIC } from 'validator'

import FullPage from '@/components/FullPage.vue'
import QRDataTable from '@/components/QRDataTable.vue'

const hasCamera = ref(false)

onBeforeMount(() => {
	navigator.mediaDevices.enumerateDevices().then(result => {
		hasCamera.value = result.some(d => d.kind == 'videoinput')
	})
})

function onDragOver(e) {
	const fileItem = e.dataTransfer.items[0]

	if (fileItem && fileItem.kind === 'file') {
		e.preventDefault()
		if (fileItem.type.startsWith("image/")) e.dataTransfer.dropEffect = "copy"
		else e.dataTransfer.dropEffect = "none"
	}
}
function onDrop(e) {
	const fileItem = e.dataTransfer.items[0]

	if (fileItem && fileItem.kind === 'file') {
		e.preventDefault()
		loadQRFromImage(fileItem.getAsFile())
	}
}

function onInputChange(e) {
	const fileItem = e.target.files[0]

	if (fileItem) loadQRFromImage(fileItem)
}

const QRString = ref(null)
const QRError = ref(null)
const QRData = ref(null)
const invalidIBAN = ref(false)
const invalidBIC = ref(false)

function loadQRFromImage(file) {
	resetQRVars()

	const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
	const img = new Image()
    img.src = URL.createObjectURL(file)
	img.onload = async () => {
		try {
			const result = await barcodeDetector.detect(img)

			if (result.length > 0) {
				QRString.value = result[0].rawValue
				decodeQRString()
			}
			else QRError.value = t('noqrinimg')
		} catch (err) {
			QRError.value = err.message
		}
	}
}

function decodeQRString() {
	if (QRString.value.startsWith('SPD*1.0')) {
		try {
			const qrObject = QRString.value.split('*').reduce((acc, item) => {
				const [key, val] = item.split(':')
				acc[key] = val
				return acc
			}, {})

			QRData.value = {
				amount: qrObject.AM || '',
				iban: qrObject.ACC ? qrObject.ACC.split('+')[0] : '',
				bic: qrObject.ACC && qrObject.ACC.includes('+') ? qrObject.ACC.split('+')[1] : '',
				name: qrObject.RN || '',
				currencyCode: qrObject.CC || '',
				variableSymbol: qrObject['X-VS'] || '',
				constantSymbol: qrObject['X-KS'] || '',
				specificSymbol: qrObject['X-SS'] || '',
				paymentDueDate: qrObject.DT ? `${qrObject.DT.substr(0, 4)}-${qrObject.DT.substr(4, 2)}-${qrObject.DT.substr(6, 2)}` : '',
				paymentNote: qrObject.MSG || '',
				type: 'spd',
			}
			invalidIBAN.value = !isIBAN(QRData.value.iban)
			if (QRData.value.bic) invalidBIC.value = !isBIC(QRData.value.bic)
		} catch (error) {
			QRError.value = t('spderr')
		}
	} else {
		try {
			const data = QRdecode(QRString.value)

			if (!data?.payments?.[0]?.amount) QRError.value = t('pbserr')
			else {
				const payment = data.payments[0]
				QRData.value = {
					amount: payment.amount || '',
					iban: payment.bankAccounts?.[0]?.iban || '',
					bic: payment.bankAccounts?.[0]?.bic || '',
					name: payment.beneficiary?.name || '',
					currencyCode: payment.currencyCode || '',
					invoiceId: data.invoiceId || '',
					variableSymbol: payment.variableSymbol || '',
					constantSymbol: payment.constantSymbol || '',
					specificSymbol: payment.specificSymbol || '',
					paymentDueDate: payment.paymentDueDate || '',
					paymentNote: payment.paymentNote || '',
					type: 'pbs',
				}
				invalidIBAN.value = !isIBAN(QRData.value.iban)
				if (QRData.value.bic) invalidBIC.value = !isBIC(QRData.value.bic)
			}
		} catch (error) {
			QRError.value = error.message
		}
	}
}

function resetQRVars() {
	QRString.value = null
	QRError.value = null
	QRData.value = null
	invalidIBAN.value = false
	invalidBIC.value = false
}

let stream
let cameraQRDetector
const cameraEl = ref(null)
const showCameraStream = ref(false)
async function mountCameraEl(el) {
	if (!el || !stream) return

	if (!stream.active) await openCameraReader()

	cameraEl.value = el
	cameraEl.value.srcObject = stream
	cameraEl.value.play()

	if (!cameraQRDetector) cameraQRDetector = new BarcodeDetector({formats: ["qr_code"] })
}
async function openCameraReader() {
	resetQRVars()

	try {
		stream = await navigator.mediaDevices.getUserMedia({ video: {facingMode: "environment"}})
		showCameraStream.value = true
	} catch (error) {
		destroyCamera()
		QRError.value = error.message
		console.log(error)
	}
}
async function onLoadedMetadata() {
	let canvas = document.createElement('canvas')
	canvas.width = cameraEl.value.videoWidth
	canvas.height = cameraEl.value.videoHeight
	let context = canvas.getContext('2d')

	let checkForQrCode = async function(){
		if (!showCameraStream.value || !cameraEl.value) return
		context.drawImage(cameraEl.value, 0, 0, canvas.width, canvas.height)

		let barcodes = await cameraQRDetector.detect(canvas)

		if (barcodes.length > 0) {
			QRString.value = barcodes[0].rawValue
			decodeQRString()
			if (QRData.value) {
				stream.getVideoTracks()?.[0]?.stop()
				return
			}
		}

		requestAnimationFrame(checkForQrCode)
	}

	checkForQrCode()
}
function destroyCamera() {
	showCameraStream.value = false
	if (stream) stream.getVideoTracks()?.[0]?.stop()
}

onBeforeUnmount(() => {
	if (showCameraStream.value) destroyCamera()
})
</script>

<template>
	<Transition name="fade" mode="out-in">
		<FullPage v-if="QRData" :header="t('qrdata')">
			<QRDataTable :data="QRData" :invalidIBAN :invalidBIC />
			<template #footer>
				<button class="button" @click="resetQRVars">{{ t('scannew') }}</button>
			</template>
		</FullPage>
		<FullPage v-else :header="t('m4')" class="qr-scan">
			<Transition name="fade" mode="out-in">
				<div v-if="!hasQRSupport" class="empty-cont">
					<IconCancel class="empty-cont-ico" />
					<h2 class="qr-error">{{ t('barnotsupported') }}</h2>
					<p>{{ t('barnotsupportednote') }}</p>
				</div>
				<div v-else-if="showCameraStream" class="empty-cont">
					<video :ref="(el) => mountCameraEl(el)" @loadedmetadata="onLoadedMetadata" class="qr-camera"></video>
					<p v-if="QRError" class="qr-error">{{ QRError }}</p>
					<div class="line">
						<button class="button" @click="destroyCamera">{{ t('cancel') }}</button>
					</div>
				</div>
				<div v-else-if="hasQRSupport" class="empty-cont">
					<label class="drop-zone" @dragover="onDragOver" @drop="onDrop">
						<IconUpload class="empty-cont-ico" />
						<div class="drop-zone-text line-smaller">{{ t('clicktoselect') }}</div>
						<input type="file" class="qr-file-input" accept="image/*" @change="onInputChange" />
					</label>
					<template v-if="hasCamera">
						<p class="divider-line">{{ t('or') }}</p>
						<p><button class="button" @click="openCameraReader">{{ t('scanqrcam') }}</button></p>
					</template>
					<p v-if="QRError" class="qr-error">{{ QRError }}</p>
				</div>
			</Transition>
		</FullPage>
	</Transition>
</template>