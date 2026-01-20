<script setup>
import { ref } from 'vue'
import { accounts, settings, qrHistory, qrFilter } from '@/store'
import { goBack } from '@/helpers'
import { IconCancel } from '@tabler/icons-vue'
import { t } from '@/lang/labels'

import FullPage from '@/components/FullPage.vue'
import AccountForm from '@/components/AccountForm.vue'
import BasicSwitch from '@/components/BasicSwitch.vue'

const form = ref(null)

const accId = window.location.hash.split('-')[1]
const originalData = accId ? Object.values(accounts.value).find(a => a.id == accId) : false

const setAsDefault = ref(accId == settings.value.defaultAcc)

function onSubmit() {
	const formData = form.value.getFieldsData()

	if (!formData) return

	Object.assign(accounts.value[accId], {
		...formData
	})

	if (setAsDefault.value) settings.value.defaultAcc = accId

	window.history.back()
}

function deleteAccount() {
	if (window.confirm(t('accdeleteq'))) {
		delete accounts.value[accId]
		if (qrFilter.value.accId == accId) qrFilter.value = ''
		qrHistory.value = qrHistory.value.filter(q => q.accId != accId)
		window.history.back()
	}
}
</script>

<template>
	<FullPage :header="t('editbankacc')" as="form" @submit.prevent="onSubmit" backButton>
		<div v-if="!accId || !originalData" class="empty-cont">
			<IconCancel class="empty-cont-ico" />
			<h2>{{ t('accna') }}</h2>
		</div>
		<div v-else>
			<AccountForm ref="form" :formData="originalData" :isDefault="accId == settings.defaultAcc" />
			<BasicSwitch :label="t('setasdefault')" v-model="setAsDefault" :disabled="accId == settings.defaultAcc" />
			<div v-if="accId != settings.defaultAcc" class="line rm-hide">
				<button @click.prevent="deleteAccount" class="button button-delete">{{ t('accdelete') }}</button>
			</div>
		</div>
		<template #footer>
			<button v-if="accId != settings.defaultAcc" @click.prevent="deleteAccount" class="button button-delete m-hide">{{ t('accdelete') }}</button>
			<button v-if="!accId || !originalData" class="button-outline" @click="goBack">{{ t('back') }}</button>
			<button v-else type="submit" class="button">{{ t('save') }}</button>
		</template>
	</FullPage>
</template>