<script setup>
import { ref, useId, computed, watch, onMounted } from 'vue'
import { IconX } from '@tabler/icons-vue'

import FieldWrapper from './FieldWrapper.vue'

const model = defineModel()
const props = defineProps({
	placeholder: String,
	type: {
		type: String,
		default: 'text'
	},
	required: Boolean,
	disabled: Boolean,
	readonly: Boolean,
	mask: String,
	error: String,
	step: Number,
	min: String,
	formatSum: Boolean,
	prefix: String,
	autocomplete: String,
	name: String,
	inputmode: String,
	lang: String,
	autofocus: Boolean
})

const id = useId()

const maskedValue = computed(() => applyMask(model.value || '', props.mask))

function applyMask(value, mask) {
	if (!mask) return value
	let output = ''
	let valIndex = 0
	const upper = value.toUpperCase()

	for (let i = 0; i < mask.length && valIndex < upper.length; i++) {
		const m = mask[i]
		const c = upper[valIndex]

		if (m === '0') {
			if (/\d/.test(c)) {
				output += c
				valIndex++
			} else {
				valIndex++
				i--
			}
		} else if (m === 'A') {
			if (/[A-Z]/.test(c)) {
				output += c
				valIndex++
			} else {
				valIndex++
				i--
			}
		} else {
			output += m
			if (c === m) valIndex++
		}
	}
	return output
}

function onInput(e) {
	if (props.mask) {
		const raw = e.target.value.replace(/[^A-Za-z0-9]/g, '')
		model.value = raw
		e.target.value = applyMask(raw, props.mask)
	} else {
		model.value = e.target.value
	}
}

function onBlur() {
	if (!model.value) return

	if (props.formatSum) {
		if (isNaN(model.value)) return
		model.value = parseFloat(String(model.value).replace(',', '.')).toFixed(2)
	} else if (props.mask) {
		const trimmedMask = props.mask.replace(/[^A-Za-z0-9]/g, '')
		const maskedValue = applyMask(model.value, trimmedMask)
		if (maskedValue != model.value) model.value = maskedValue
	} else {
		const trimmedVal = model.value.trim()
		if (trimmedVal != model.value) model.value = trimmedVal
	}
}

const prefixWidth = ref(null)
const prefixRef = ref(null)
function setPrefixRef(el) {
	if (!el) return

	prefixRef.value = el
	setPrefixWidth()
}
function setPrefixWidth() {
	requestAnimationFrame(() => {
		prefixWidth.value = `${prefixRef.value.clientWidth}px`
	})
}
watch(() => props.prefix, newVal => {
	setPrefixWidth()
})

const inputEl = ref(null)
onMounted(() => {
	if (props.autofocus) inputEl.value.focus()
})
</script>

<template>
	<FieldWrapper :id :error :required useLabel>
		<div class="field-input-outer" :style="{'--prefix': prefixWidth}">
			<input ref="inputEl" class="field-input" :class="{hasError: error, hasPrefix: prefix}" :name :id :type :autocomplete :lang :min :step :placeholder :required :disabled :readonly :inputmode :value="maskedValue" @input="onInput" @blur="onBlur" />
			<span v-if="prefix" :ref="(el) => setPrefixRef(el)" class="field-prefix">{{ prefix }}</span>
			<div class="field-input-buttons">
				<button v-if="type != 'date'" type="button" class="field-input-button" :class="{noVal: !model}" @click="model = ''" tabindex="-1">
					<IconX />
				</button>
			</div>
		</div>
	</FieldWrapper>
</template>