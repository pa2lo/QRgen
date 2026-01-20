<script setup>
import { ref } from 'vue'
import { goBack } from '@/helpers'
import { IconArrowLeft } from '@tabler/icons-vue'

const props = defineProps({
	header: String,
	as: String,
	backButton: Boolean
})
const el = ref(null)
function getElement() {
	return el.value
}
defineExpose({getElement})
</script>

<template>
	<component ref="el" :is="as || 'div'" class="full-page">
		<div v-if="header" class="full-page-header">
			<button v-if="backButton" class="button-back" @click.prevent="goBack" type="button"><IconArrowLeft /></button>
			<h1>{{ header }}</h1>
		</div>
		<div class="full-page-cont line"><slot /></div>
		<div v-if="$slots.footer" class="full-page-footer"><slot name="footer" /></div>
	</component>
</template>