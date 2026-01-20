<script setup>
import { accounts, settings, accTypesMap } from '@/store'
import { IconEdit, IconCreditCardOff } from '@tabler/icons-vue'
import { t } from '@/lang/labels'

import FullPage from '@/components/FullPage.vue'

function openEditAccount(id) {
	window.location.hash = `#editAccount-${id}`
}
</script>

<template>
	<FullPage :header="t('m2')">
		<div class="empty-cont" v-if="!Object.keys(accounts).length">
			<IconCreditCardOff class="empty-cont-ico" />
			<h2>{{ t('noaccs') }}</h2>
			<p>{{ t('noaccsentence2') }} <strong>{{ t('newbankacc') }}</strong></p>
		</div>
		<div v-else class="acc-list">
			<div v-for="acc in accounts" class="acc-item" :class="{isSelected: settings.defaultAcc == acc.id}" @click="settings.defaultAcc = acc.id">
				<div class="fake-radio"></div>
				<div class="acc-item-info">
					<div class="acc-name">{{ acc.internalName || acc.name }}</div>
					<div class="acc-iban"><strong>{{ acc.currencyCode }}</strong> - {{ accTypesMap[acc.type] }}</div>
					<div class="acc-iban">{{ acc.iban }}</div>
				</div>
				<div class="acc-item-buttons">
					<button @click.stop="openEditAccount(acc.id)" class="button-ico"><IconEdit /></button>
				</div>
			</div>
		</div>
		<template #footer>
			<a href="#addAccount" class="button">{{ t('newbankacc') }}</a>
		</template>
	</FullPage>
</template>