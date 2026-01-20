<script setup>
import { lang } from '@/store'
import { t } from '@/lang/labels'

import FullPage from '@/components/FullPage.vue'
import PWAInstaller from '@/components/PWAInstaller.vue'
</script>

<template>
	<FullPage :header="t('m5')">
		<p>
			<img class="about-logo" src="/favicon.svg" alt="" />
		</p>
		<div v-if="lang == 'sk'" class="line">
			<p><strong>QRgen</strong> je jednoduchá webová aplikácia na vytváranie platobných QR kódov pre <strong>PAY by square (Slovensko)</strong> a <strong>SPD (Česko)</strong>.</p>
			<p>V prehliadačoch ako <strong>Chrome, Edge, Brave či Opera</strong>, môžete využiť vstavanú <strong>čítačku QR kódov</strong> – buď nahraním obrázka, alebo priamo skenovaním fotoaparátom.</p>
			<p>Stránku si môžete <strong>pridať do zariadenia</strong> ako klasickú aplikáciu a používať ju aj <strong>offline</strong>, bez pripojenia na internet.</p>
			<p>Všetky údaje sa ukladajú <strong>iba vo vašom zariadení</strong> – vygenerované QR kódy ani žiadne iné dáta sa nikam neodosielajú.</p>
			<p>Zdrojový kód stránky je k dispozícií na <a href="https://github.com/pa2lo/QRgen" target="_blank" rel="noopener noreferrer">GitHube</a>.</p>
		</div>
		<div v-else-if="lang == 'cz'" class="line">
			<p><strong>QRgen</strong> je jednoduchá webová aplikace pro vytváření platebních QR kódů pro <strong>PAY by square (Slovensko)</strong> a <strong>SPD (Česko)</strong>.</p>
			<p>V prohlížečích jako <strong>Chrome, Edge, Brave nebo Opera</strong>, můžete využít vestavěnou <strong>čtečku QR kódů</strong> – buď nahráním obrázku, nebo přímo skenováním fotoaparátem.</p>
			<p>Stránku si můžete <strong>přidat do zařízení</strong> jako klasickou aplikaci a používat ji také <strong>offline</strong>, bez připojení na internet.</p>
			<p>Všechny údaje se ukládají <strong>pouze ve vašem zařízení</strong> – vygenerované QR kódy ani žádná jiná data se nikam neodesílají.</p>
			<p>Zdrojový kód stránky je k dispozici na <a href="https://github.com/pa2lo/QRgen" target="_blank" rel="noopener noreferrer">GitHubu</a>.</p>
		</div>
		<div v-else class="line">
			<p><strong>QRgen</strong> is a simple web application for creating payment QR codes for <strong>PAY by square (Slovakia)</strong> a <strong>SPD (Czech Republic)</strong>.</p>
			<p>In browsers such as <strong>Chrome, Edge, Brave or Opera</strong>, you can use the built-in <strong>QR code reader</strong> – either by uploading an image or directly scanning it with your camera.</p>
			<p>You can add the site <strong>to your device</strong> as a classic application and use it <strong>offline</strong>, without an internet connection.</p>
			<p>All data is stored <strong>only on your device</strong> – neither the generated QR codes nor any other data is sent anywhere.</p>
			<p>The source code of the website is available on <a href="https://github.com/pa2lo/QRgen" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
		</div>
		<PWAInstaller />
	</FullPage>
</template>