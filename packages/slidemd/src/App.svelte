<script lang="ts">
	import { SlideController, SlideLayout, SlideZoom } from '@slidemd/slidemd/components'
	import { loadTheme } from '@slidemd/slidemd/shared'
	import { SlideState } from '@slidemd/slidemd/state'

	import { onMount } from 'svelte'

	import Slide, { slide } from './example/marp.md'

	const slideWidth = 1280
	const slideHeight = 720
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
