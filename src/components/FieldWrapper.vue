<script setup>
import { t } from '@/lang/labels'

const props = defineProps({
	id: String,
	label: String,
	labelNote: String,
	required: Boolean,
	error: String,
	useLabel: Boolean,
	half: Boolean
})
</script>

<template>
	<div class="line field-cont" :class="{fieldHalf: half}">
		<component v-if="label" :is="useLabel ? 'label' : 'div'" :for="useLabel && id ? id : null" class="field-label">
			{{ label }}
			<span class="field-label-required" v-if="labelNote">({{ labelNote }})</span>
			<span class="field-label-required" v-if="required">({{ t('req') }})</span>
		</component>
		<slot />
		<span v-if="error" class="field-error">{{ error }}</span>
	</div>
</template>