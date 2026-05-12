<script lang="ts">
	import { resolvePageSize } from '@lib/utils'

	import type { Snippet } from 'svelte'

	interface Props {
		width: number
		height: number
		overlay?: Snippet
		children: Snippet
	}

	let { width, height, children, overlay }: Props = $props()

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
		style:width="{width}px"
		style:height="{height}px"
		style:translate="-50% -50%"
		style:scale={slideSize}
	>
		{@render children()}
	</section>

	{@render overlay?.()}
</section>
