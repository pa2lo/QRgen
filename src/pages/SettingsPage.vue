<script setup>
import { ref } from 'vue'
import { settings, appearance, lang, accounts, accTypesMap, qrHistory } from '@/store'
import { IconEdit } from '@tabler/icons-vue'
import { t } from '@/lang/labels'

import FullPage from '@/components/FullPage.vue'
import RadioGroup from '@/components/RadioGroup.vue'
import ColorInput from '@/components/ColorInput.vue'

const langOptions = [{val: 'sk', title: 'SK'}, {val: 'cz', title: 'CZ'}, {val: 'en', title: 'EN'}]
const themeOptions = [{val: 'auto', title: 'appearanceo1'}, {val: 'dark', title: 'appearanceo2'}, {val: 'light', title: 'appearanceo3'}]
const showQRButtonOptions = [{val: 'onclick', title: 'sqrbuttono1'}, {val: 'timeout', title: 'sqrbuttono2'}, {val: 'visible', title: 'sqrbuttono3'}]
const showQRDownloadOptions = [{val: true, title: 'sqrdowno1'}, {val: false, title: 'sqrdowno2'}]
const roundTipOptions = [{val: false, title: 'no'}, {val: true, title: 'yes'}]

function openEditAccount(id) {
	window.location.hash = `#editAccount-${id}`
}

function exportData() {
	let dataObject = {
		accounts: accounts.value,
		history: qrHistory.value
	}

	const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(dataObject))}`
	const link = Object.assign(document.createElement("a"), {
		href: jsonString,
		download: `QRgen-backup-${Date.now()}.json`
	})

	link.click()
}
const importNote = ref({
	type: 'error',
	message: ''
})
function importData() {
	importNote.value.message = ''

	const input = Object.assign(document.createElement('input'), {
		type: 'file',
		accept: '.json,application/JSON',
		onchange(e) {
			if (e.target.files) {
				const file = e.target.files[0]
				if (file.name.includes('.json') && file.type == 'application/json') {
					const reader = new FileReader()
					reader.onerror = (err) => importNote.value = {type: 'error', message: err}
					reader.onload = (data) => {
						let fileData = JSON.parse(data.target.result)

						if (!fileData.accounts) {
							importNote.value = {type: 'error', message: 'importerrnodata'}
							return
						}

						if (Object.keys(accounts.value).length) {
							if (window.confirm(t('restoreconf'))) importDataHelper(fileData)
						} else importDataHelper(fileData)
					}
					reader.readAsText(file)
				} else importNote.value = {type: 'error', message: 'importerrformat'}
			}
		}
	})

	input.click()
}
function importDataHelper(fileData) {
	accounts.value = fileData.accounts
	if (fileData.history?.length) qrHistory.value = fileData.history
	settings.value.defaultAcc = Object.keys(accounts.value)[0]

	importNote.value = {type: 'success', message: 'importsuccess'}
}
</script>

<template>
	<FullPage :header="t('m3')">
		<h2>{{ t('m2') }}</h2>
		<div v-if="Object.keys(accounts).length" class="line acc-list">
			<div  v-for="acc in accounts" class="acc-item" :class="{isSelected: settings.defaultAcc == acc.id}" @click="settings.defaultAcc = acc.id">
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
		<div class="line line-button">
			<a href="#addAccount" class="button">{{ t('newbankacc') }}</a>
		</div>
		<h2 class="line line-divided">{{ t('appsettings') }}</h2>
		<div class="form-grid line">
			<RadioGroup :options="langOptions" :label="t('lang')" v-model="lang" />
			<RadioGroup :options="themeOptions" :label="t('appearance')" v-model="appearance" />
			<RadioGroup :options="roundTipOptions" :label="t('roundpercenttip')" v-model="settings.roundTip" />
		</div>
		<h2 class="line line-divided">{{ t('qrsettings') }}</h2>
		<div class="form-grid line">
			<RadioGroup :options="showQRButtonOptions" :label="t('sqrbutton')" v-model="settings.qrbutton" />
			<RadioGroup :options="showQRDownloadOptions" :label="t('sqrdown')" v-model="settings.showQRDownload" />
			<ColorInput :label="t('qrBg')" v-model="settings.qrBackground" default="#FFFFFF" />
			<ColorInput :label="t('qrFg')" v-model="settings.qrForeground" default="#0271c0" />
		</div>
		<h2 class="line line-divided">{{ t('backuprestore') }}</h2>
		<div class="form-grid line">
			<div class="field-cont">
				<button class="button" :disabled="!Object.keys(accounts).length" @click="exportData">{{ t('bakup') }}</button>
			</div>
			<div class="field-cont">
				<button class="button" @click="importData">{{ t('restore') }}</button>
				<div v-if="importNote.message" :class="importNote.type == 'error' ? 'field-error' : 'field-success'">{{ t(importNote.message) }}</div>
			</div>
		</div>
	</FullPage>
</template>