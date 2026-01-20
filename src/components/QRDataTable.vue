<script setup>
import { onBeforeUnmount, ref, onBeforeUpdate, computed } from 'vue'
import { accTypesMap } from '@/store'
import { formatDate, formatSum } from '@/helpers'
import { IconCheck, IconAlertTriangle } from '@tabler/icons-vue'
import { t } from '@/lang/labels'

const props = defineProps({
	data: Object,
	invalidIBAN: Boolean,
	invalidBIC: Boolean
})

const infoItems = computed(() => {
	return Object.entries(props.data).reduce((acc, [k, v]) => {
		if (['invoiceId', 'ts', 'iban', 'bic', 'amount', 'name', 'currencyCode', 'variableSymbol', 'constantSymbol', 'specificSymbol', 'paymentDueDate', 'paymentNote', 'internalNote', 'type'].includes(k) && v) acc[k] = v
		return acc
	}, {})
})

const QRKeysMap = {
	invoiceId: t('invid'),
	ts: t('created'),
	iban: 'IBAN',
	bic: 'BIC / SWIFT',
	name: t('accname'),
	amount: t('am'),
	currencyCode: t('currency'),
	variableSymbol: 'VS',
	constantSymbol: 'KS',
	specificSymbol: 'SS',
	paymentDueDate: t('date'),
	paymentNote: t('paymsg'),
	internalNote: t('inonote'),
	type: t('qrformat'),
	originalAmount: t('poriginal'),
	percentTip: t('tip')
}

function getQRDetailValue(name, val) {
	if (name == 'ts') return formatDate(val)
	else if (name == 'type') return accTypesMap[val]
	else if (name == 'amount' || name == 'originalAmount') return formatSum(val, props.data.currencyCode)
	return val
}

const copiedKey = ref('')
let copiedKeyTimeout = null
async function copyToClipboard(k, v) {
	if (!k || !v) return

	await navigator.clipboard.writeText(getQRDetailValue(k, v)).then(() => {
		copiedKey.value = k
		if (copiedKeyTimeout) clearTimeout(copiedKeyTimeout)
		copiedKeyTimeout = setTimeout(() => {
			copiedKey.value = ''
		}, 2000)
	})
}

onBeforeUnmount(() => {
	if (copiedKeyTimeout) clearTimeout(copiedKeyTimeout)
})
</script>

<template>
	<table v-if="data" class="line detail-table">
		<tbody>
			<template v-for="(val, name) in infoItems">
				<tr @click="copyToClipboard(name, val)" :class="`detail-table-row-${name}`">
					<td>{{ QRKeysMap[name] }}</td>
					<td class="detail-table-dataCol" :class="{hasInvalidCode: (name == 'iban' && invalidIBAN) || (name == 'bic' && invalidBIC)}">
						{{ getQRDetailValue(name, val) }}
						<IconAlertTriangle v-if="name == 'iban' && invalidIBAN" class="data-info-invalid" :title="t('inviban')" />
						<IconAlertTriangle v-if="name == 'bic' && invalidBIC" class="data-info-invalid" :title="t('invbic')" />
						<span v-if="copiedKey == name" class="copied">
							<IconCheck class="copied-ico" />
							<span class="copied-text">{{ t('copied') }}</span>
						</span>
					</td>
				</tr>
			</template>
		</tbody>
	</table>
	<template v-if="data.originalAmount">
		<h4 class="detail-tip-title">{{ t('tip') }}</h4>
		<table class="detail-table">
			<tbody>
				<tr>
					<td>{{ t('poriginal') }}</td>
					<td class="detail-table-dataCol">{{ formatSum(data.originalAmount, data.currencyCode) }}</td>
				</tr>
				<tr v-if="data.diffTip">
					<td>{{ t('tipamount') }}</td>
					<td class="detail-table-dataCol">{{ formatSum(data.diffTip, data.currencyCode) }}</td>
				</tr>
				<tr v-if="data.percentTip">
					<td>{{ t('tippercent') }}</td>
					<td class="detail-table-dataCol">{{ data.percentTip }}%</td>
				</tr>
			</tbody>
		</table>
	</template>
</template>