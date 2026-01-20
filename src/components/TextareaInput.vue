<script setup>
import { useId } from 'vue'

import FieldWrapper from './FieldWrapper.vue'

const model = defineModel()
const props = defineProps({
	placeholder: String,
	rows: {
		type: Number,
		default: 2
	},
	required: Boolean,
	disabled: Boolean,
	error: String
})

const id = useId()
</script>

<template>
	<FieldWrapper :id :error :required useLabel>
		<div class="field-input-outer">
			<textarea class="field-textarea" :class="{hasError: error}" :id :placeholder :required :disabled :rows v-model="model"></textarea>
		</div>
	</FieldWrapper>
</template>