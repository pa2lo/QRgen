<script setup>
import { ref, computed } from 'vue'
import { qrHistory, currencyOptions, accounts, qrFilter } from '@/store'
import { IconQrcodeOff, IconFilter, IconFilterFilled, IconChevronDown, IconCreditCardOff, IconTrash } from '@tabler/icons-vue'
import { t } from '@/lang/labels'

import FullPage from '@/components/FullPage.vue'
import BasicDialog from '@/components/BasicDialog.vue'
import RadioGroup from '@/components/RadioGroup.vue'
import AccountSelect from '@/components/AccountSelect.vue'
import BasicInput from '@/components/BasicInput.vue'
import BasicDrawer from '@/components/BasicDrawer.vue'
import QRDataTable from '@/components/QRDataTable.vue'
import HistoryItem from '@/components/HistoryItem.vue'
import BasicSwitch from '@/components/BasicSwitch.vue'
import PWAInstaller from '@/components/PWAInstaller.vue'

const filteredQRs = computed(() => {
	return qrHistory.value.filter(q => {
		let ret = true
		if (qrFilter.value.accId) ret = q.accId == qrFilter.value.accId
		if (ret && qrFilter.value.currencyCode) ret = q.currencyCode == qrFilter.value.currencyCode
		if (ret && qrFilter.value.amountFrom) ret = parseFloat(q.amount) >= parseFloat(qrFilter.value.amountFrom)
		if (ret && qrFilter.value.amountTo) ret = parseFloat(q.amount) <= parseFloat(qrFilter.value.amountTo)
		if (ret && qrFilter.value.dateFromTS) ret = q.ts >= qrFilter.value.dateFromTS
		if (ret && qrFilter.value.dateToTS) ret = q.ts <= qrFilter.value.dateToTS
		if (ret && qrFilter.value.tipsOnly) ret = q.originalAmount ? true : false

		return ret
	})
})
const filteredQRsByDay = computed(() => {
	return filteredQRs.value?.reduce((acc, item) => {
		const dateString = new Date(item.ts).toLocaleDateString('sk')
		if (acc[dateString]) acc[dateString].push(item)
		else acc[dateString] = [item]
		return acc
	}, {})
})

const extCurrencyOptions = [{ val: '', title: 'all'}, ...currencyOptions]

const detailPopup = ref(null)
const filterPopup = ref(null)
const detailData = ref(null)
function showDetail(ts) {
	const qr = qrHistory.value.find(qr => qr.ts == ts)
	if (!qr) return

	detailData.value = qr
	detailPopup.value.showModal()
}

function openQR(id, closeDialog) {
	if (closeDialog && detailPopup.value) detailPopup.value.closeModal()
	window.location.hash = `#showQR-${id}`
}

function duplicateQR(id, closeDialog) {
	if (closeDialog && detailPopup.value) detailPopup.value.closeModal()
	window.location.hash = `#duplicateQR-${id}`
}

function deleteQR(ts) {
	if (detailPopup.value) detailPopup.value.closeModal()
	qrHistory.value = qrHistory.value.filter(qr => qr.ts != ts)
}

function setDateFrom(e) {
	qrFilter.value.dateFromTS = e.target.valueAsNumber == NaN ? '' : e.target.valueAsNumber
}
function setDateTo(e) {
	qrFilter.value.dateToTS = e.target.valueAsNumber == NaN ? '' : e.target.valueAsNumber + 86400000
}

const hasActiveFilter = computed(() => {
	return qrHistory.value.length && (['accId', 'currencyCode', 'dateFromTS', 'dateToTS', 'amountFrom', 'amountTo'].some(k => qrFilter.value[k] != '') || qrFilter.value.tipsOnly)
})

const filteredQRsText = computed(() => {
	let num = filteredQRs.value.length
	if (!num) return t('filterres0')
	if (num == 1) return t('filterres1')
	if (num < 5 && num > 1) return `${num} ${t('filterres3')}`
	return `${num} ${t('filterres5')}`
})

function resetFilter() {
	Object.keys(qrFilter.value).forEach(k => {
		if (k == 'tipsOnly') qrFilter.value[k] = false
		else qrFilter.value[k] = ''
	})
}
</script>

<template>
	<FullPage :header="t('m1')">
		<button v-if="qrHistory.length" type="button" class="float-filter rm-hide" @click="filterPopup.showModal()">
			<IconFilterFilled v-if="hasActiveFilter" />
			<IconFilter v-else />
			{{ t('filter') }}
		</button>
		<Transition name="fade" mode="out-in">
			<div class="empty-cont" v-if="!filteredQRs.length">
				<IconQrcodeOff class="empty-cont-ico" />
				<template v-if="hasActiveFilter">
					<h2>{{ t('filterres0') }}</h2>
					<div class="line">
						<button class="button button-delete button-narrow" @click="resetFilter">{{ t('resetfilter') }}</button>
					</div>
				</template>
				<template v-else>
					<h2>{{ t('noqrgenerated') }}</h2>
					<p>{{ t('newqrsentence') }} <strong>{{ t('newqr') }}</strong></p>
				</template>
			</div>
			<div v-else class="history-days">
				<TransitionGroup name="qrs">
					<details class="history-day" v-for="(items, day, i) in filteredQRsByDay" open :key="day">
						<summary class="history-day-summary">
							<span class="history-day-title">{{ day }}</span>
							<span class="history-day-count">{{ items.length }}</span>
							<IconChevronDown class="history-day-ico" />
						</summary>
						<TransitionGroup name="qrs" type="transition">
							<HistoryItem v-for="(qr, i) in items" :qr="qr" @showQR="showDetail" @openQR="openQR" @deleteQR="deleteQR" @duplicateQR="duplicateQR" :key="qr.ts" />
						</TransitionGroup>
					</details>
				</TransitionGroup>
				<div v-if="hasActiveFilter" class="line ta-c">
					<button class="button button-delete button-narrow" @click="resetFilter">{{ t('resetfilter') }}</button>
				</div>
				<PWAInstaller :showCancel="true" />
			</div>
		</Transition>
		<template #footer>
			<button v-if="qrHistory.length" type="button" class="button-outline m-hide" @click="filterPopup.showModal()">
				<IconFilterFilled v-if="hasActiveFilter" class="button-outline-ico" />
				<IconFilter v-else class="button-outline-ico" />
				{{ t('filter') }}
			</button>
			<a href="#newQR" class="button">{{ t('newqr') }}</a>
		</template>
		<BasicDialog ref="detailPopup" :header="t('qrdetail')">
			<QRDataTable v-if="detailData" :data="detailData" />
			<template v-if="detailData" #buttons>
				<button @click.prevent="deleteQR(detailData.ts)" class="button button-delete">{{ t('deleteqr') }}</button>
				<button class="button button-outline" @click="duplicateQR(detailData.ts, true)">{{ t('duplicateqr') }}</button>
				<button class="button" @click="openQR(detailData.ts, true)">{{ t('showqr') }}</button>
			</template>
		</BasicDialog>
		<BasicDrawer ref="filterPopup" :header="t('filter')">
			<div class="form-grid">
				<AccountSelect v-if="Object.keys(accounts).length > 1" v-model="qrFilter.accId" allowAll />
				<RadioGroup :label="t('currency')" :options="extCurrencyOptions" v-model="qrFilter.currencyCode" />
				<BasicInput half :label="t('amfrom')" type="number" min="0" placeholder="-" v-model="qrFilter.amountFrom" inputmode="decimal" />
				<BasicInput half :label="t('amto')" type="number" min="0" placeholder="-" v-model="qrFilter.amountTo" inputmode="decimal" />
				<BasicInput half :label="t('datefrom')" type="date" v-model="qrFilter.dateFrom" @input="setDateFrom" />
				<BasicInput half :label="t('dateto')" type="date" v-model="qrFilter.dateTo" @input="setDateTo" />
				<BasicSwitch :label="t('tipsonly')" v-model="qrFilter.tipsOnly" />
			</div>
			<div class="line">{{ filteredQRsText }}</div>
			<template #buttons>
				<button class="button button-delete" :disabled="!hasActiveFilter" @click="resetFilter">{{ t('reset') }}</button>
				<button class="button" @click="filterPopup.closeModal()">{{ t('close') }}</button>
			</template>
		</BasicDrawer>
	</FullPage>
</template>