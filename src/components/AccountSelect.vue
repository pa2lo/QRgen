<script setup>
import { useId } from 'vue'
import { accounts } from '@/store'
import { IconCheck, IconChevronDown } from '@tabler/icons-vue'
import { t } from '@/lang/labels'

const model = defineModel()
const props = defineProps({
	allowAll: Boolean,
	allowNew: Boolean
})

const id = useId()

function closePopover(e) {
	e.target.closest('.field-acc-dd').hidePopover()
}
function onLabelClick(e) {
	if (e.pointerType) closePopover(e)
}
function onKeyPress(e) {
	if (e.code == 'Space' || e.code == 'Enter') {
		e.preventDefault()
		closePopover(e)
	}
}
</script>

<template>
	<div class="line field-account">
		<div class="field-label">{{ t('acc') }}</div>
		<button class="field-acc-toggle" :popovertarget="id" type="button">
			<span class="acc-item-info">
				<strong v-if="model == 'new'">{{ t('newacc') }}</strong>
				<strong v-else-if="model == ''">{{ t('accsall') }}</strong>
				<strong v-else>{{ accounts[model]?.internalName || accounts[model]?.name }} <span v-if="model" class="acc-name-light"> - {{ accounts[model]?.currencyCode }}</span></strong>
			</span>
			<IconChevronDown class="field-acc-toggle-ico" />
		</button>
		<div :id class="field-acc-dd" popover>
			<label v-if="allowAll" class="field-acc-option" :class="{isActive: model == ''}" @click="onLabelClick" @keypress="onKeyPress">
				<input type="radio" :name="id" class="field-acc-input" value="" v-model="model" :autofocus="model == ''" />
				<span class="acc-item-info">
					<strong>{{ t('accsall') }}</strong>
				</span>
				<IconCheck v-if="model == ''" class="field-acc-toggle-ico" />
			</label>
			<label v-for="acc in accounts" class="field-acc-option" :class="{isActive: acc.id == model}" @click="onLabelClick" @keypress="onKeyPress">
				<input type="radio" :name="id" class="field-acc-input" :value="acc.id" v-model="model" :autofocus="acc.id == model" />
				<span class="acc-item-info">
					<strong>{{ acc.internalName || acc.name }}<span class="acc-name-light"> - {{ acc.currencyCode }}</span></strong>
					<span class="acc-iban acc-iban-opt">{{ acc.iban }}</span>
				</span>
				<IconCheck v-if="acc.id == model" class="field-acc-toggle-ico" />
			</label>
			<label v-if="allowNew" class="field-acc-option" :class="{isActive: 'new' == model}" @click="onLabelClick" @keypress="onKeyPress">
				<input type="radio" :name="id" class="field-acc-input" value="new" v-model="model" :autofocus="model == 'new'" />
				<span class="acc-item-info">
					<strong>{{ t('newacc') }}</strong>
				</span>
				<IconCheck v-if="model == 'new'" class="field-acc-toggle-ico" />
			</label>
		</div>
	</div>
</template>