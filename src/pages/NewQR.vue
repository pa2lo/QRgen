<script setup>
import { toRaw } from 'vue'
import { accounts, settings } from '@/store'
import { getQRDate } from '@/helpers'

import QRForm from './QRForm.vue'

const defaultAccId = toRaw(settings.value.defaultAcc)
const defaultData = toRaw(accounts.value[defaultAccId])

const { currentDate, minDate } = getQRDate(defaultData?.date == 'tomorrow')

const autoVS = defaultData?.autoVS || false

let data = {
	accId: defaultAccId || 'new',
	amount: '',
	currencyCode: defaultData?.currencyCode || 'EUR',
	variableSymbol: defaultData?.variableSymbol || '',
	constantSymbol: defaultData?.constantSymbol || '',
	specificSymbol: defaultData?.specificSymbol || '',
	paymentDueDate: `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2, 0)}-${String(currentDate.getDate()).padStart(2, 0)}`,
	paymentNote: defaultData?.paymentNote || '',
	internalNote: '',
	type: defaultData?.type || 'pbs'
}
</script>

<template>
	<QRForm :data :currentDate :minDate :autoVS />
</template>