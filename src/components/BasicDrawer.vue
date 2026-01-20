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
function closeModal() {
	dialogEl.value.close()
}

defineExpose({ showModal, closeModal })

/* handle move events */
let start = {}
let offY = ref(0)
function onTouchStart(e) {
	if (e.touches.length > 1 || window.visualViewport.scale > 1.01 || dialogEl.value.scrollTop > 0 || e.target.closest('[popover]')) return removeDomEvents()

	start = {
		x: e.changedTouches[0]?.clientX,
		y: e.changedTouches[0]?.clientY
	}

	addDomEvents()
}

function addDomEvents() {
	document.addEventListener('touchmove', onTouchMove, {passive: true})
	document.addEventListener('touchend', onTouchEnd, {passive: true})
}

function removeDomEvents(reset) {
	if (reset) offY.value = 0
	document.removeEventListener('touchmove', onTouchMove)
	document.removeEventListener('touchend', onTouchEnd)
}

function onTouchMove(e) {
	if (window.visualViewport.scale > 1.01) return
	const { clientX: endX, clientY: endY } = e.changedTouches[0]

	const diffX = endX - start.x,
		diffY = endY - start.y,
		absX = Math.abs(diffX),
		absY = Math.abs(diffY)

	if (diffY < -5) removeDomEvents(true)
	else if (absY > absX) offY.value = Math.max(0, diffY - 10)
}

function onTouchEnd(e) {
	if (offY.value > 100) closeModal()
	requestAnimationFrame(() => {
		removeDomEvents(offY.value < 101)
	})
}

function onAnimationEnd(e) {
	offY.value = 0
}
</script>

<template>
	<dialog ref="dialogEl" :id class="drawer" @mousedown.self="closeModal" closedBy="closerequest" :class="{isMoving: offY > 0}" :style="{'--offY': `${offY}px`}" @touchstart="onTouchStart" @animationend="onAnimationEnd" @animationcancel="onAnimationEnd">
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