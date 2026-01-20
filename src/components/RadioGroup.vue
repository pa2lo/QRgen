<script setup>
import { useId } from 'vue'
import { t } from '@/lang/labels'

import FieldWrapper from './FieldWrapper.vue'

const model = defineModel()
const props = defineProps({
	options: Array,
	required: Boolean,
	disabled: Boolean,
	error: String
})

const id = useId()
</script>

<template>
	<FieldWrapper :id :error :required>
		<div class="field-group" :class="{hasError: error}">
			<label v-for="opt in options" class="field-group-label">
				<input class="field-group-input" type="radio" :name="id" :value="opt.val" :disabled :required v-model="model" />
				<span class="field-group-text">{{ t(opt.title) }}</span>
			</label>
		</div>
	</FieldWrapper>
</template>