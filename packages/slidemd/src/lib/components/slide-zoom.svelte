<script lang="ts">
	import { SlideState } from '@lib/utils'

	import type { Snippet } from 'svelte'

	interface Props {
		slideState: SlideState
		children: Snippet
	}

	let { slideState, children }: Props = $props()

	let enableZoom = $derived(slideState.scale != 1)

	let isDragging = $state(false)
	let startX = $state(0)
	let startY = $state(0)
	let translateX = $state(0)
	let translateY = $state(0)
	let containerW = $state(0)
	let containerH = $state(0)

	$effect(() => {
		if (!enableZoom) {
			translateX = 0
			translateY = 0
		}
	})

	function clampTranslate(val: number, width: number, scale: number) {
		const minMax = (width * (scale - 1)) / 2
		console.log({ val, width, scale, minMax })
		return Math.min(-minMax, Math.max(minMax, val))
	}

	function onPointerdown(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLDivElement
		}
	) {
		isDragging = true
		startX = e.clientX - translateX
		startY = e.clientY - translateY
	}

	function onPointermove(
		e: MouseEvent & {
			currentTarget: EventTarget & HTMLDivElement
		}
	) {
		if (!isDragging) return
		translateX = e.clientX - startX
		translateY = e.clientY - startY
	}

	function onPointerup() {
		isDragging = false
	}
</script>

<!-- {#if enableZoom} -->
<div
	id="zoom-contrainer"
	role="presentation"
	class="h-full w-full"
	bind:clientWidth={containerW}
	bind:clientHeight={containerH}
	onpointerdown={onPointerdown}
	onpointermove={onPointermove}
	onpointerup={onPointerup}
>
	<section
		id="zoom-content"
		class="flex h-full w-full select-none"
		style:scale={slideState.scale}
		style:translate="{translateX}px {translateY}px"
		draggable="false"
	>
		{@render children()}
	</section>
</div>
