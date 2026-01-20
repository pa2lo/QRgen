<script setup>
import { ref, useId } from 'vue'
import { IconX } from '@tabler/icons-vue'

const props = defineProps({
	header: String
})

const id = useId()

const dialogEl = ref(null)

function showModal() {
	dialogEl.value.showModal()
}
function closeModal(e) {
	dialogEl.value.close()
}

defineExpose({ showModal, closeModal })
</script>

<template>
	<dialog ref="dialogEl" :id class="dialog" @mousedown.self="closeModal" closedBy="closerequest">
		<div class="dialog-inner">
			<button type="button" class="dialog-x" command="close" :commandfor="id"><IconX /></button>
			<h2>{{ header }}</h2>
			<div class="dialog-main line">
				<slot />
			</div>
			<div v-if="$slots.buttons" class="line dialog-buttons" ><slot name='buttons' /></div>
		</div>
	</dialog>
</template>