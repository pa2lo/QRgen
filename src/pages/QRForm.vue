<script setup>
import { ref, toRaw, watch } from 'vue'
import { settings, accounts, qrHistory, currencyOptions, typeOptions } from '@/store'
import { getVSByTime } from '@/helpers'
import { t } from '@/lang/labels'
import { isIBAN, isBIC } from 'validator'

import FullPage from '@/components/FullPage.vue'
import BasicInput from '@/components/BasicInput.vue'
import RadioGroup from '@/components/RadioGroup.vue'
import TextareaInput from '@/components/TextareaInput.vue'
import BasicSelect from '@/components/BasicSelect.vue'
import AccountSelect from '@/components/AccountSelect.vue'
import BasicSwitch from '@/components/BasicSwitch.vue'

const props = defineProps({
	data: Object,
	currentDate: Date,
	minDate: String,
	autoVS: Boolean
})

const emit = defineEmits(['save'])

const defaultAVS = getVSByTime()

const useAutoVS = ref(props.autoVS)

const form = ref({
	accId: props.data.accId,
	iban: '',
	bic: '',
	name: '',
	amount: props.data.amount,
	currencyCode: props.data.currencyCode,
	variableSymbol: props.data.variableSymbol,
	constantSymbol: props.data.constantSymbol,
	specificSymbol: props.data.specificSymbol,
	paymentDueDate: props.data.paymentDueDate,
	paymentNote: props.data.paymentNote,
	internalNote: props.data.internalNote,
	type: props.data.type
})

const errors = ref({
	accId: '',
	iban: '',
	bic: '',
	name: '',
	amount: '',
	currencyCode: '',
	paymentDueDate: '',
	type: ''
})

const formEl = ref(null)
function submitTip() {
	const isValid = formEl.value.getElement().reportValidity()
	if (isValid) saveQR(null, true)
}
function saveQR(e, setTip) {
	clearErrors()

	Object.keys(errors.value).forEach(k => {
		if (['iban', 'bic', 'name'].includes(k)) {
			if (form.value.accId == 'new' && !form.value[k]) errors.value[k] = t('fieldreq')
		} else if (!form.value[k]) errors.value[k] = t('fieldreq')
	})

	if (form.value.accId == 'new') {
		if (form.value.iban.length != 24 || !isIBAN(form.value.iban)) errors.value.iban = t('inviban')
		if (form.value.bic && !isBIC(form.value.bic)) errors.value.bic = t('invbic')
	}

	if (Object.values(errors.value).some(v => v != '')) return false

	let newAccId
	if (form.value.accId == 'new') {
		newAccId = Date.now()
		accounts.value[newAccId] = {
			id: newAccId,
			iban: form.value.iban,
			bic: form.value.bic,
			name: form.value.name || '',
			internalName: '',
			variableSymbol: '',
			constantSymbol: '',
			specificSymbol: '',
			paymentNote: '',
			currencyCode: form.value.currencyCode,
			type: form.value.type,
			date: 'today',
			autoVS: false
		}

		if (Object.keys(accounts.value).length == 1) settings.value.defaultAcc = newAccId
	}

	if (useAutoVS.value) form.value.variableSymbol = defaultAVS

	const ts = Date.now()
	const qrData = Object.assign({
		accId: form.value.accId == 'new' ? newAccId : form.value.accId,
		amount: parseFloat(form.value.amount),
		ts,
		iban: form.value.accId == 'new' ? form.value.iban : accounts.value[form.value.accId].iban,
		bic: form.value.accId == 'new' ? form.value.bic : accounts.value[form.value.accId].bic,
		name: form.value.accId == 'new' ? form.value.name : accounts.value[form.value.accId].name,
		currencyCode: form.value.currencyCode,
		variableSymbol: form.value.variableSymbol,
		constantSymbol: form.value.constantSymbol,
		specificSymbol: form.value.specificSymbol,
		paymentDueDate: form.value.paymentDueDate,
		paymentNote: form.value.paymentNote,
		internalNote: form.value.internalNote,
		type: form.value.type
	})

	qrHistory.value.unshift(qrData)

	emit('save', setTip == true ? `setTip-${ts}` : `showQR-${ts}`)
}

function clearErrors() {
	Object.keys(errors.value).forEach(k => {
		errors.value[k] = ''
	})
}

watch(() => form.value.accId, (newVal, oldVal) => {
	if (newVal == 'new' || oldVal == 'new') return

	let originalAcc = accounts.value[oldVal];
	let newAcc = accounts.value[newVal];

	['currencyCode', 'variableSymbol', 'constantSymbol', 'specificSymbol', 'paymentNote', 'type'].forEach(v => {
		if (form.value[v] == originalAcc[v]) form.value[v] = newAcc[v]
	})

	if (newAcc.autoVS && form.value.variableSymbol == originalAcc.variableSymbol) useAutoVS.value = true
	else if (!newAcc.autoVS && originalAcc.autoVS && useAutoVS.value) useAutoVS.value = false
})
</script>

<template>
	<FullPage ref="formEl" :header="t('newqr')" as="form" @submit.prevent="saveQR" backButton>
		<div class="form-grid">
			<AccountSelect v-if="Object.keys(accounts).length" v-model="form.accId" allowNew />
			<template v-if="form.accId == 'new'">
				<BasicInput label="IBAN" name="iban" inputmode="decimal" autocomplete="iban" placeholder="SKXX XXXX XXXX XXXX XXXX XXXX" mask="AA00 0000 0000 0000 0000 0000" required v-model="form.iban" :error="errors.iban" />
				<BasicInput label="BIC / SWIFT" placeholder="-" v-model="form.bic" :error="errors.bic" required />
				<BasicInput :label="t('accname')" placeholder="Moje Meno" required v-model="form.name" :error="errors.name" />
			</template>
			<BasicInput class="field34 field-bigger" :label="t('am')" type="number" v-model="form.amount" placeholder="0" lang="sk" min="0" :step="0.01" required formatSum inputmode="decimal" :error="errors.amount" autofocus autocomplete="off" />
			<BasicSelect class="field14" :options="currencyOptions" :label="t('currency')" v-model="form.currencyCode" :error="errors.currencyCode" />
			<RadioGroup :options="typeOptions" :label="t('qrformat')" required v-model="form.type" :error="errors.type" />
			<BasicInput half :label="t('varsymb')" :placeholder="useAutoVS ? defaultAVS : '-'" mask="0000000000" :maxlength="10" v-model="form.variableSymbol" inputmode="decimal" :disabled="useAutoVS" />
			<BasicInput half :label="t('specsymb')" placeholder="-" mask="0000000000" :maxlength="10" v-model="form.specificSymbol" inputmode="decimal" />
			<BasicSwitch class="fieldCol1" :label="t('autovs')" v-model="useAutoVS" />
			<BasicInput half :label="t('constsymb')" placeholder="-" mask="0000" :maxlength="4" v-model="form.constantSymbol" inputmode="decimal" />
			<BasicInput half :label="t('duedate')" type="date" :min="minDate" :maxlength="4" v-model="form.paymentDueDate" :error="errors.paymentDueDate" />
			<TextareaInput :label="t('paymsg')" placeholder="-" v-model="form.paymentNote" />
			<TextareaInput :label="t('inonote')" :labelNote="t('notinqr')" placeholder="-" v-model="form.internalNote" />
		</div>
		<template #footer>
			<button type="button" class="button button-outline" @click="submitTip">{{ t('tip') }}</button>
			<button type="submit" class="button">{{ t('createqr') }}</button>
		</template>
	</FullPage>
</template>