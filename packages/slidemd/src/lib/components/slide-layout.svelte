<script lang="ts">
	import { SlideState, resolvePageSize } from '@lib/utils'

	import type { Snippet } from 'svelte'

	interface Props {
		width: number
		height: number
		overlay?: Snippet
		children: Snippet
		slideState: SlideState
	}

	let { width, height, children, overlay, slideState }: Props = $props()

	let layoutWidth = $state(0)
	let layoutHeight = $state(0)
	let slideSize = $derived(resolvePageSize(width, height, layoutWidth, layoutHeight))
</script>

<section
	id="slide-layout"
	class="relative h-full w-full content-center overflow-hidden bg-black"
	bind:clientWidth={layoutWidth}
	bind:clientHeight={layoutHeight}
>
	<section
		id="slide-container"
		class="absolute top-1/2 left-1/2 flex overflow-hidden"
		class:rounded-xl={slideState.scale < 1}
		style:font-size={slideState.fontSize + 'px'}
		style:width="{width}px"
		style:height="{height}px"
		style:translate="-50% -50%"
		style:scale={slideSize * slideState.scale}
	>
		{@render children()}
	</section>

	{@render overlay?.()}
</section>
