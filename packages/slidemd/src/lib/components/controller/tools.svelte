<script lang="ts">
	import { SlideState } from '@slidemd/slidemd/state'

	interface Props {
		slideState: SlideState
	}

	let { slideState }: Props = $props()

	let fullscreen = $state(!!document.fullscreenElement)

	function onFullscreen() {
		if (!document.fullscreenElement) {
			fullscreen = true
			document.documentElement.requestFullscreen()
		} else {
			fullscreen = false
			document.exitFullscreen()
		}
	}
</script>

<div class="menu">
	<button onclick={onFullscreen} title="fullscreen" class="menu-btn rounded-l-sm">
		{#if fullscreen}
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
				<path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
				<path d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
				<path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
				<path d="M9 4.2V9m0 0H4.2M9 9 3 3" />
			</svg>
		{:else}
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
				<path d="m15 15 6 6" />
				<path d="m15 9 6-6" />
				<path d="M21 16v5h-5" />
				<path d="M21 8V3h-5" />
				<path d="M3 16v5h5" />
				<path d="m3 21 6-6" />
				<path d="M3 8V3h5" />
				<path d="M9 9 3 3" />
			</svg>
		{/if}
	</button>
	<div class=" border-border border-l"></div>
	<button title="zoom" popovertarget="zoom-panel" class="menu-btn zoom-btn rounded-r-sm">
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
			<circle cx="11" cy="11" r="8" />
			<line x1="21" x2="16.65" y1="21" y2="16.65" />
			<line x1="11" x2="11" y1="8" y2="14" />
			<line x1="8" x2="14" y1="11" y2="11" />
		</svg>
	</button>

	<div
		popover
		id="zoom-panel"
		class="text-card-foreground zoom-panel bg-card border-border rounded-md border p-2 px-4"
	>
		<input type="range" class="w-40" min="1" max="3" step="0.01" bind:value={slideState.zoom} />
		<span class="w-10 text-right text-sm">{Math.round(slideState.zoom * 100)}%</span>
	</div>
</div>

<style lang="postcss">
	.zoom-btn {
		anchor-name: --zoom-btn;
	}

	.zoom-panel {
		position: fixed;
		position-anchor: --zoom-btn;
		position-area: top center;
		bottom: 24px;

		&[popover] {
			display: none;
		}

		&[popover]:popover-open {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
	}
</style>
