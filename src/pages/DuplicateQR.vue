<script setup>
import { toRaw } from 'vue'
import { accounts, qrHistory } from '@/store'
import { getQRDate } from '@/helpers'

import QRForm from './QRForm.vue'

const paymentId = window.location.hash.split('-')[1]

const QRData = qrHistory.value.find(qr => qr.ts == paymentId)

const defaultAccId = toRaw(QRData.accId)
const defaultData = toRaw(accounts.value[defaultAccId])

const { currentDate, minDate } = getQRDate(defaultData?.date == 'tomorrow')

const autoVS = defaultData?.autoVS || false

let data = {
	accId: QRData.accId,
	amount: QRData.amount,
	currencyCode: QRData.currencyCode,
	variableSymbol: QRData.variableSymbol,
	constantSymbol: QRData.constantSymbol,
	specificSymbol: QRData.specificSymbol,
	paymentDueDate: `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2, 0)}-${String(currentDate.getDate()).padStart(2, 0)}`,
	paymentNote: QRData.paymentNote,
	internalNote: QRData.internalNote,
	type: QRData.type
}
</script>

<template>
	<QRForm :data :currentDate :minDate :autoVS />
</template>