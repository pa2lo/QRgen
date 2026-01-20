<script setup>
import { useId } from 'vue'

const model = defineModel()

const props = defineProps({
	label: String,
	required: Boolean,
	disabled: Boolean
})

const id = useId()
</script>

<template>
	<label class="line field-switch">
		<input class="field-switch-input" :name="id" type="checkbox" v-model="model" :required :disabled />
		<span class="field-switch-label"><slot>{{ label }}</slot></span>
	</label>
</template>