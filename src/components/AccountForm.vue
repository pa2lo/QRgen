<script setup>
import { ref, toRaw } from 'vue'
import { currencyOptions, typeOptions, dateOptions } from '@/store'
import { getVSByTime } from '@/helpers'
import { t } from '@/lang/labels'
import { isIBAN, isBIC } from 'validator'

import BasicInput from './BasicInput.vue'
import RadioGroup from './RadioGroup.vue'
import TextareaInput from './TextareaInput.vue'
import BasicSwitch from './BasicSwitch.vue'

const props = defineProps({
	formData: Object
})

const form = ref({
	iban: props.formData?.iban || '',
	bic: props.formData?.bic || '',
	name: props.formData?.name || '',
	internalName: props.formData?.internalName || '',
	variableSymbol: props.formData?.variableSymbol || '',
	constantSymbol: props.formData?.constantSymbol || '',
	specificSymbol: props.formData?.specificSymbol || '',
	paymentNote: props.formData?.paymentNote || '',
	currencyCode: props.formData?.currencyCode || 'EUR',
	type: props.formData?.type || 'pbs',
	date: props.formData?.date || 'today',
	autoVS: props.formData?.autoVS || false
})

const errors = ref({
	iban: '',
	bic: '',
	name: '',
	currencyCode: '',
	type: '',
	date: ''
})

const defaultAVS = getVSByTime()

function clearErrors() {
	Object.keys(errors.value).forEach(k => {
		errors.value[k] = ''
	})
}

function getFieldsData() {
	clearErrors()

	Object.keys(errors.value).forEach(k => {
		if (!form.value[k] && k != 'bic') errors.value[k] = t('fieldreq')
	})

	if (form.value.iban.length != 24 || !isIBAN(form.value.iban)) errors.value.iban = t('inviban')
	if (form.value.bic && !isBIC(form.value.bic)) errors.value.bic = t('invbic')
	if (form.value.autoVS && form.value.variableSymbol != '') form.value.variableSymbol = ''

	if (Object.values(errors.value).some(v => v != '')) return false

	return toRaw(form.value)
}

defineExpose({getFieldsData})
</script>

<template>
	<div class="form-grid">
		<BasicInput label="IBAN" name="iban" inputmode="decimal" autocomplete="iban" placeholder="SKXX XXXX XXXX XXXX XXXX XXXX" mask="AA00 0000 0000 0000 0000 0000" required v-model="form.iban" :error="errors.iban" />
		<BasicInput half label="BIC / SWIFT" placeholder="-" v-model="form.bic" :error="errors.bic" required />
		<RadioGroup half :options="currencyOptions" :label="t('currency')" required v-model="form.currencyCode" :error="errors.currencyCode" />
		<BasicInput :label="t('accname')" placeholder="Moje Meno" required v-model="form.name" :error="errors.name" />
		<BasicInput :label="t('accintname')" :placeholder="t('accintplaceholder')" v-model="form.internalName" />
		<RadioGroup :options="typeOptions" :label="t('qrformat')" required v-model="form.type" :error="errors.type" />
		<BasicInput half :label="t('varsymb')" :placeholder="form.autoVS ? defaultAVS : '-'" mask="0000000000" :maxlength="10" v-model="form.variableSymbol" :disabled="form.autoVS" />
		<BasicInput half :label="t('specsymb')" placeholder="-" mask="0000000000" :maxlength="10" v-model="form.specificSymbol" />
		<BasicSwitch class="fieldCol1" :label="t('autovs')" v-model="form.autoVS" />
		<BasicInput half :label="t('constsymb')" placeholder="-" mask="0000" :maxlength="4" v-model="form.constantSymbol" />
		<RadioGroup half :options="dateOptions" :label="t('duedate')" v-model="form.date" :error="errors.date" />
		<TextareaInput :label="t('paymsg')" placeholder="-" v-model="form.paymentNote" />
	</div>
</template>