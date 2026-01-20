<script setup>
import { ref, useId, computed } from 'vue'

import FieldWrapper from './FieldWrapper.vue'

const model = defineModel()
const props = defineProps({
	placeholder: String,
	required: Boolean,
	disabled: Boolean,
	readonly: Boolean,
	error: String,
	name: String,
	default: String
})

const id = useId()

let lastColor = model.value
const colorProxyModel = computed({
	get() {
		if (model.value) {
			let trimModel = model.value.trim()
			if (trimModel.startsWith('#')) {
				if (trimModel.length == 7) {
					if (lastColor != trimModel) lastColor = trimModel
					return trimModel
				} else if (trimModel.length == 4) {
					let newValue = `#${trimModel[1].repeat(2)}${trimModel[2].repeat(2)}${trimModel[3].repeat(2)}`
					lastColor = newValue
					return newValue
				}
			}
		}
		if (lastColor) return lastColor
		else return '#000000'
	},
	set(val) {
		model.value = val
	}
})

function onBlur() {
	let newModelValue = model.value.trim()
	if (newModelValue.length && !newModelValue.startsWith('#')) newModelValue = `#${newModelValue}`
	if (newModelValue.length > 7) newModelValue = newModelValue.slice(0, 7)
	if (newModelValue.length == 4) newModelValue = `#${newModelValue[1].repeat(2)}${newModelValue[2].repeat(2)}${newModelValue[3].repeat(2)}`
	if (newModelValue != model.value) model.value = newModelValue
	if (newModelValue.length == 7) lastColor = newModelValue
	if (props.default && (!newModelValue || newModelValue.length != 7)) model.value = props.default
}
</script>

<template>
	<FieldWrapper :id :error :required useLabel>
		<div class="field-input-outer">
			<input class="field-input field-input-color" :class="{hasError: error}" :name :id type="text" :placeholder :required :disabled :readonly v-model="model" @blur="onBlur" />
			<input class="field-color-picker" type="color" v-model="colorProxyModel" />
		</div>
	</FieldWrapper>
</template>