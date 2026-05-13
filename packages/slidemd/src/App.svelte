<script lang="ts">
	import { SlideController, SlideLayout } from '@lib/components'
	import SlideZoom from '@lib/components/slide-zoom.svelte'
	import { loadTheme } from '@lib/events/theme'
	import { SlideState, slideHeight, slideWidth } from '@lib/utils'

	import { onMount } from 'svelte'

	import Slide, { slide } from './example/marp.md'

	const slideState = new SlideState(slide)

	onMount(() => {
		loadTheme()
	})
</script>

<main class="h-full w-full">
	<SlideLayout {slideState} width={slideWidth} height={slideHeight}>
		<SlideZoom {slideState}>
			<Slide bind:page={slideState.page} bind:step={slideState.step} />
		</SlideZoom>

		{#snippet overlay()}
			<SlideController {slideState} />
		{/snippet}
	</SlideLayout>
</main>
