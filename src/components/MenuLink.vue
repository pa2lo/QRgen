<script setup>
const props = defineProps({
	label: String,
	isActive: Boolean,
	icon: Function
})
</script>

<template>
	<button class="nav-link" :class="{linkActive: isActive}" :disabled="isActive">
		<component :is="icon" class="nav-link-ico" />
		<div class="nav-link-text">{{ label }}</div>
	</button>
</template>