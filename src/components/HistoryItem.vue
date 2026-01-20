<script setup>
import { ref } from 'vue'
import { formatSum, formatDate } from '@/helpers'
import { t } from '@/lang/labels'

import { IconTrash, IconQrcode, IconCopy } from '@tabler/icons-vue'

const props = defineProps({
	qr: Object
})

const emit = defineEmits(['deleteQR', 'openQR', 'showQR', 'duplicateQR'])

const container = ref(null)
const holdClasses = ref(false)

function onScroll() {
	if (window.visualViewport.scale > 1.02 || !container.value) return

	if (container.value.scrollLeft < container.value.clientWidth - 130 || container.value.scrollLeft > container.value.clientWidth + 130) {
		if (!holdClasses.value) holdClasses.value = true
	} else {
		if (holdClasses.value) holdClasses.value = false
	}

	if (container.value?.scrollLeft == 0 && holdClasses.value) {
		setTimeout(() => {
			emit('deleteQR', props.qr.ts)
		}, 50)
	} else if (container.value?.scrollLeft >= container.value?.clientWidth * 2 + 16 && holdClasses.value) {
		setTimeout(() => {
			emit('duplicateQR', props.qr.ts)
		}, 50)
	}
}
</script>

<template>
	<div ref="container" class="history-item" @scroll="onScroll">
		<div class="history-button-x-cont" :class="{holdLeft: holdClasses}">
			<div class="history-button-x-inner">
				<IconTrash class="history-button-x" />
				<span class="history-button-x-text">{{ t('deleteqr') }}</span>
			</div>
		</div>
		<div class="history-item-info" @click="$emit('showQR', qr.ts)">
			<div class="acc-name">{{ formatSum(qr.amount, qr.currencyCode) }}</div>
			<div class="history-iban">{{ formatDate(qr.ts) }}</div>
			<button class="history-button" @click.stop="$emit('openQR', qr.ts)">
				<IconQrcode class="history-button-ico" />
			</button>
		</div>
		<div class="history-button-clone-cont" :class="{holdLeft: holdClasses}">
			<div class="history-button-clone-inner">
				<span class="history-button-clone-text">{{ t('duplicateqr') }}</span>
				<IconCopy class="history-button-clone" />
			</div>
		</div>
	</div>
</template>