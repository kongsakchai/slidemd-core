<script lang="ts">
	import { resolvePageSize, slideHeight, slideWidth } from '@lib/utils'

	import type { Snippet } from 'svelte'

	interface Props {
		overlay?: Snippet
		children: Snippet
	}

	let { children, overlay }: Props = $props()

	let width = $state(0)
	let height = $state(0)
	let slideSize = $derived(resolvePageSize(slideWidth, slideHeight, width, height))
</script>

<section
	id="slide-stage"
	class="relative h-full w-full content-center overflow-hidden bg-black"
	bind:clientWidth={width}
	bind:clientHeight={height}
>
	<section
		id="slide-container"
		class="absolute top-1/2 left-1/2 flex overflow-hidden"
		style:width="{slideWidth}px"
		style:height="{slideHeight}px"
		style:translate="-50% -50%"
		style:scale={slideSize}
	>
		{@render children()}
	</section>

	{@render overlay?.()}
</section>
