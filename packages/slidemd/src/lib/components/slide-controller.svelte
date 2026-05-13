<script lang="ts">
	import { SlideState } from '@lib/utils'

	import Appearance from './controller/appearance.svelte'
	import Navigator from './controller/navigator.svelte'
	import Tools from './controller/tools.svelte'

	interface Props {
		slideState: SlideState
	}

	let { slideState }: Props = $props()
</script>

<div class="controller absolute bottom-10 left-10 flex gap-4">
	<Navigator {slideState} />
	<Tools {slideState} />
	<Appearance {slideState} />
</div>

<style lang="postcss">
	@reference "tailwindcss";
	@reference "@lib/themes/slidemd.css";

	.controller :global {
		.menu {
			@apply bg-card border-border text-card-foreground flex gap-0.5 rounded-md border p-0.5 shadow-2xl;
		}
		.menu-btn {
			@apply hover:bg-accent hover:text-accent-foreground h-8.5 w-8.5 content-center;
		}
		input[type='range'] {
			@apply bg-input h-2 appearance-none rounded-full p-0.5;

			&::-webkit-slider-thumb {
				@apply bg-card ring-primary relative h-3 w-3 appearance-none rounded-full ring-2;
			}

			&::-moz-range-track {
				@apply bg-card ring-primary relative h-3 w-3 appearance-none rounded-full ring-2;
			}
		}
	}
</style>
