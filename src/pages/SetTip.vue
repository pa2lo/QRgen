<script setup>
import { computed, ref } from 'vue'
import { qrHistory, currencySymbolsMap, settings } from '@/store'
import { t } from '@/lang/labels'
import { formatSum } from '@/helpers'
import { IconCancel, IconBackspace } from '@tabler/icons-vue'
import FullPage from '@/components/FullPage.vue'
import BasicDrawer from '@/components/BasicDrawer.vue'
import RadioGroup from '@/components/RadioGroup.vue'

const emit = defineEmits(['save'])

const QRts = window.location.hash.split('-')[1]

const QRData = ref(qrHistory.value.find(qr => qr.ts == QRts))

const options = []
const realPrice = QRData.value.originalAmount ? parseFloat(QRData.value.originalAmount) : parseFloat(QRData.value.amount)
const cc = QRData.value.currencyCode
const multipliedRealPrice = realPrice * 100
const roundedPrice = cc == 'CZK' ? Math.ceil(realPrice / 10) * 10 : Math.ceil(realPrice);

[5, 10, 15, 20, 25, 30, 35].forEach(x => {
	let newPrice = parseFloat((multipliedRealPrice * (1 + (x / 100)) / 100).toFixed(2))
	options.push({
		k: x,
		price: cc == 'CZK' || settings.value.roundTip ? Math.ceil(newPrice) : Math.ceil(newPrice * 10) / 10
	})
})

const reducedOptions = options.reduce((acc, item, index, arr) => {
	if ((index > 0 && item.price == arr[index - 1].price) || item.price == roundedPrice || acc.length == 4) return acc
	acc.push(item)
	return acc
}, [])

function saveQR(amount, percent) {
	const historyItem = qrHistory.value.find(qr => qr.ts == QRts)

	if (!historyItem || historyItem.amount == amount) return redirectToQR()

	historyItem.originalAmount = realPrice
	historyItem.amount = amount
	historyItem.diffTip = parseFloat(((amount * 100) - (historyItem.originalAmount * 100)) / 100)
	if (percent) historyItem.percentTip = percent
	else historyItem.percentTip = Math.round((amount / historyItem.originalAmount) * 100) - 100

	redirectToQR()
}
function redirectToQR() {
	emit('save', `showQR-${QRts}`)
}

const customTipModal = ref(null)
function showCustomTipModal() {
	customTipModal.value.showModal()
}

const customTipOptions = [{val: 'amount', title: 'amm'}, {val: 'percent', title: 'percent'}, {val: 'total', title: 'total'}]
const customTipType = ref('amount')

const tipAmountVal = ref("0")
const tipPercentVal = ref("0")
const tipTotalVal = ref("0")

const customTipModel = computed(() => {
	if (customTipType.value == 'percent') return tipPercentVal
	else if (customTipType.value == 'total') return tipTotalVal
	else return tipAmountVal
})
const tipTotal = computed(() => {
	if (customTipType.value == 'total') {
		const parsedTotal = parseFloat(tipTotalVal.value.replace(',','.'))
		if (parsedTotal < realPrice) return -1
		return parsedTotal - realPrice
	}
	return customTipType.value == 'amount' ? realPrice + parseFloat(tipAmountVal.value.replace(',', '.')) : realPrice * (1 + (parseFloat(tipPercentVal.value) / 100))
})

function onTipBttnClick(v) {
	const val = customTipModel.value.value

	if (v == ',' && (val.includes(',') || customTipType.value == 'percent')) return
	if (/,..+/.test(val)) return

	if (val == 0 && !val.includes(',') && v != ',') customTipModel.value.value = String(v)
	else customTipModel.value.value += String(v)
}
function delLastChar() {
	if (customTipModel.value.value == 0 && !customTipModel.value.value.includes(',')) return
	else if (customTipModel.value.value.length == 1) customTipModel.value.value = "0"
	else customTipModel.value.value = customTipModel.value.value.slice(0, -1)
}

function confirmCustomTip() {
	if (customTipType.value == 'percent') return saveQR(getRawValue(tipTotal.value), parseInt(tipPercentVal.value))
	else if (customTipType.value == 'total') return saveQR(getRawValue(tipTotalVal.value.replace(',','.')))
	else return saveQR(getRawValue(tipTotal.value))
}
function getRawValue(formatted) {
	return Math.round(formatted * 100) / 100
}
</script>

<template>
	<FullPage>
		<div v-if="!QRData || !QRts" class="empty-cont">
			<IconCancel class="empty-cont-ico" />
			<h2>{{ t('qrna') }}</h2>
		</div>
		<div v-else class="tips-cont">
			<div class="subtotal-cont">
				<div class="subtotal-title">{{ t('subtotal') }}</div>
				<div class="subtotal-sum">{{ formatSum(realPrice, cc) }}</div>
			</div>
			<button v-if="roundedPrice != realPrice" class="button" @click.prevent="saveQR(roundedPrice)">{{ t('prounded') }} - {{ formatSum(roundedPrice, cc) }}</button>
			<div class="tips-grid">
				<button v-for="tip in reducedOptions" class="button tip-button" @click.prevent="saveQR(tip.price, tip.k)">
					<div class="tip-title">{{ tip.k }}%</div>
					<div class="tip-amount">{{ formatSum(tip.price, cc) }}</div>
				</button>
			</div>
			<button class="button" @click.prevent="showCustomTipModal">{{ t('custom') }}</button>
			<button class="button button-outline" @click.prevent="redirectToQR">{{ t('notip') }}</button>
		</div>
		<BasicDrawer ref="customTipModal" :header="t('custom')">
			<div class="custom-tip-wrapper line ta-c">
				<div class="tip-note">{{ t(customTipType == 'total' ? 'total' : 'tip') }}:</div>
				<div class="tip-sum">
					<span class="tip-sum-num">{{ customTipModel }}</span>
					<span v-if="customTipType == 'percent'">%</span>
					<span v-else>{{ currencySymbolsMap[cc] }}</span>
				</div>
				<div v-if="tipTotal == -1" class="tip-note-hl">{{ t('toosmallnum') }}</div>
				<div v-else class="tip-note">{{ t(customTipType != 'total' ? 'total' : 'tip') }}: {{ formatSum(tipTotal, cc) }}</div>
			</div>
			<RadioGroup :options="customTipOptions" v-model="customTipType" />
			<div class="line tip-nums-grid">
				<button class="tip-num-bttn" @click.prevent="onTipBttnClick(1)">1</button>
				<button class="tip-num-bttn" @click.prevent="onTipBttnClick(2)">2</button>
				<button class="tip-num-bttn" @click.prevent="onTipBttnClick(3)">3</button>
				<button class="tip-num-bttn" @click.prevent="onTipBttnClick(4)">4</button>
				<button class="tip-num-bttn" @click.prevent="onTipBttnClick(5)">5</button>
				<button class="tip-num-bttn" @click.prevent="onTipBttnClick(6)">6</button>
				<button class="tip-num-bttn" @click.prevent="onTipBttnClick(7)">7</button>
				<button class="tip-num-bttn" @click.prevent="onTipBttnClick(8)">8</button>
				<button class="tip-num-bttn" @click.prevent="onTipBttnClick(9)">9</button>
				<button class="tip-num-bttn" @click.prevent="onTipBttnClick(',')" :disabled="customTipType == 'percent'">,</button>
				<button class="tip-num-bttn" @click.prevent="onTipBttnClick(0)">0</button>
				<button class="tip-num-bttn" @click.prevent="delLastChar"><IconBackspace /></button>
			</div>
			<button class="button line" @click.prevent="confirmCustomTip" :disabled="tipTotal == -1">{{ t('confirm') }}</button>
		</BasicDrawer>
	</FullPage>
</template>