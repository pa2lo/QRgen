<script setup>
import { installPrompt, installPromptClosed, needRefresh, installApp, closeInstall } from '@/store'
import { t } from '@/lang/labels'

const props = defineProps({
	showCancel: Boolean
})
</script>

<template>
	<div v-if="needRefresh" class="line line-divided">
		<div class="install-cont">
			<div class="install-cont-text">
				<h3>New content available, click on Update button to update.</h3>
			</div>
			<div class="line-button">
				<button class="button" @click="updateServiceWorker()">Update</button>
				<button class="button button-outline" @click="needRefresh = false">Close</button>
			</div>
		</div>
	</div>
	<div v-else-if="installPrompt && ((showCancel && !installPromptClosed) || !showCancel)" class="line line-divided">
		<div class="install-cont">
			<div class="install-cont-text">
				<h2>{{ t('downloadapptitle') }}</h2>
				<p>{{ t('downloadwebapp') }}</p>
			</div>
			<div class="line-button">
				<button class="button" @click.prevent="installApp">{{ t('downloadwebappbttn') }}</button>
				<button v-if="showCancel" class="button button-outline" @click.prevent="closeInstall">{{ t('cancel') }}</button>
			</div>
		</div>
	</div>
</template>