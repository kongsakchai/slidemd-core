<script lang="ts">
	import { onMount } from 'svelte'

	let themeMode = $state('')

	onMount(() => {
		themeMode = localStorage.getItem('slidemd.mode') || 'light'
	})

	function switchTheme() {
		if (themeMode === 'dark') {
			themeMode = 'light'
			document.documentElement.classList.remove('dark')
		} else {
			themeMode = 'dark'
			document.documentElement.classList.add('dark')
		}
		localStorage.setItem('slidemd.mode', themeMode)
	}
</script>

<div class="menu">
	<button onclick={switchTheme} title="switch-theme" class="menu-btn rounded-l-sm">
		{#if themeMode === 'light'}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="mx-auto"
			>
				<circle cx="12" cy="12" r="4" />
				<path d="M12 2v2" />
				<path d="M12 20v2" />
				<path d="m4.93 4.93 1.41 1.41" />
				<path d="m17.66 17.66 1.41 1.41" />
				<path d="M2 12h2" />
				<path d="M20 12h2" />
				<path d="m6.34 17.66-1.41 1.41" />
				<path d="m19.07 4.93-1.41 1.41" />
			</svg>
		{:else if themeMode === 'dark'}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="mx-auto"
			>
				<path
					d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
				/>
			</svg>
		{/if}
	</button>
	<!-- <div class=" border-border border-l"></div> -->
</div>

<style lang="postcss">
</style>
