<script setup>
import { useId } from 'vue'
import { IconChevronDown } from '@tabler/icons-vue'

import FieldWrapper from './FieldWrapper.vue'

const model = defineModel()

const props = defineProps({
	options: Array,
	name: String,
	required: Boolean,
	disabled: Boolean,
	error: String
})

const id = useId()
</script>

<template>
	<FieldWrapper :id :error :required useLabel>
		<div class="field-select-outer">
			<select class="field-select" :class="{hasError: error}" :name :id :required :disabled v-model="model">
				<option v-for="option in options" :value="option.val">{{ option.title }}</option>
			</select>
			<IconChevronDown class="field-select-ico" />
		</div>
	</FieldWrapper>
</template>