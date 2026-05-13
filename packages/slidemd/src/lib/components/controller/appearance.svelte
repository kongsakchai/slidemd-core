<script lang="ts">
	import type { SlideState } from '@lib/utils'

	import { onMount } from 'svelte'

	interface Props {
		slideState: SlideState
	}

	let { slideState }: Props = $props()

	let themeMode = $state('')

	onMount(() => {
		themeMode = localStorage.getItem('slidemd.mode') || 'light'
		if (themeMode === 'dark' && !document.documentElement.classList.contains('dark')) {
			document.documentElement.classList.add('dark')
		}
	})

	function switchTheme() {
		document.documentElement.classList.toggle('dark')
		themeMode = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
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
	<div class=" border-border border-l"></div>
	<button title="setting" class="menu-btn setting-btn rounded-r-sm" popovertarget="setting-panel">
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
			<path d="M4 5h16" />
			<path d="M4 12h16" />
			<path d="M4 19h16" />
		</svg>
	</button>

	<!-- Popover -->
	<div
		popover
		id="setting-panel"
		class="text-card-foreground setting-panel bg-card border-border rounded-md border p-2 px-4"
	>
		<span class=" text-sm">Font Size</span>
		<input type="range" min="10" max="64" step="1" bind:value={slideState.fontSize} />
		<span class=" text-sm">{slideState.fontSize}px</span>
		<button title="reset-font" class="menu-btn rounded-sm" onclick={() => slideState.resetFontSize()}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="mx-auto"
			>
				<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
				<path d="M21 3v5h-5" />
				<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
				<path d="M8 16H3v5" />
			</svg>
		</button>

		<span class="text-sm">Slide Scale</span>
		<input type="range" min="0.1" max="1" step="0.01" bind:value={slideState.scale} />
		<span class=" text-sm">{Math.round(slideState.scale * 100)}%</span>

		<button title="reset-scale" class="menu-btn rounded-sm" onclick={() => slideState.resetScale()}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="mx-auto"
			>
				<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
				<path d="M21 3v5h-5" />
				<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
				<path d="M8 16H3v5" />
			</svg>
		</button>
	</div>
</div>

<style lang="postcss">
	.setting-btn {
		anchor-name: --setting-btn;
	}

	.setting-panel {
		position: fixed;
		position-anchor: --setting-btn;
		position-area: top center;
		bottom: 24px;

		&[popover] {
			display: none;
		}

		&[popover]:popover-open {
			display: grid;
			grid-template-columns: 75px 10rem 40px 24px;
			align-items: center;
			gap: 0.5rem;
		}
	}
</style>
