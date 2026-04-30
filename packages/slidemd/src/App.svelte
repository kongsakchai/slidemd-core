<script lang="ts">
	import { SlideController, SlideLayout } from '@lib/components'
	import SlideZoom from '@lib/components/slide-zoom.svelte'
	import { SlideState } from '@lib/utils'

	import Slide, { slide } from './example/marp.md'

	const slideState = new SlideState(slide)
</script>

<main class="h-full w-full">
	<SlideLayout>
		<SlideZoom {slideState}>
			<Slide bind:page={slideState.page} bind:step={slideState.step} />
		</SlideZoom>

		{#snippet overlay()}
			<SlideController {slideState} />
		{/snippet}
	</SlideLayout>
</main>
