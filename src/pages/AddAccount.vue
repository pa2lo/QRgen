<script setup>
import { ref } from 'vue'
import { accounts, settings } from '@/store'
import { t } from '@/lang/labels'

import FullPage from '@/components/FullPage.vue'
import AccountForm from '@/components/AccountForm.vue'
import BasicSwitch from '@/components/BasicSwitch.vue'

const force = Object.keys(accounts.value).length < 1

const form = ref(null)
const setAsDefault = ref(true)

function onSubmit() {
	const formData = form.value.getFieldsData()

	if (!formData) return

	const id = Date.now()
	accounts.value[id] = {
		id,
		...formData
	}
	if (setAsDefault.value) settings.value.defaultAcc = id

	if (window.location.hash) window.history.back()
}
</script>

<template>
	<FullPage :header="t('newbankacc')" as="form" @submit.prevent="onSubmit" backButton>
		<AccountForm ref="form" :force />
		<BasicSwitch :label="t('setasdefault')" v-model="setAsDefault" :disabled="force" />
		<template #footer>
			<button type="submit" class="button">{{ t('save') }}</button>
		</template>
	</FullPage>
</template>