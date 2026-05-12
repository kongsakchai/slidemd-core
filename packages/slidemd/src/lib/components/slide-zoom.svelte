<script lang="ts">
	import { SlideState } from '@lib/utils'

	import { type Snippet } from 'svelte'

	interface Props {
		slideState: SlideState
		children: Snippet
	}

	interface ZoomState {
		isDragging: boolean
		startX: number
		startY: number
		panY: number
		panX: number
	}

	let { slideState, children }: Props = $props()

	let zoomEl: HTMLElement

	let enableZoom = $derived(slideState.scale != 1)

	let zoom = $state<ZoomState>({
		isDragging: false,
		startX: 0,
		startY: 0,
		panX: 0,
		panY: 0
	})

	let scale = $derived.by(() => {
		return slideState.scale
	})

	let layoutLimit = $derived.by(() => {
		return {
			x: ((zoomEl?.clientWidth || 0) * (scale - 1)) / 2,
			y: ((zoomEl?.clientHeight || 0) * (scale - 1)) / 2
		}
	})

	$effect(() => {
		if (!enableZoom) {
			zoom.panX = 0
			zoom.panY = 0
		}
	})

	function clamp(val: number, min: number, max: number) {
		return Math.max(min, Math.min(max, val))
	}

	function onPointerdown(e: PointerEvent) {
		zoom.isDragging = enableZoom
		zoom.startX = e.clientX - zoom.panX
		zoom.startY = e.clientY - zoom.panY
	}

	function onPointermove(e: PointerEvent) {
		if (!zoom.isDragging) return

		zoom.panX = clamp(e.clientX - zoom.startX, -layoutLimit.x, layoutLimit.x)
		zoom.panY = clamp(e.clientY - zoom.startY, -layoutLimit.y, layoutLimit.y)
	}

	function onPointerup() {
		zoom.isDragging = false
	}

	let translateX = $derived(clamp(zoom.panX, -layoutLimit.x, layoutLimit.x))
	let translateY = $derived(clamp(zoom.panY, -layoutLimit.y, layoutLimit.y))
</script>

<section
	bind:this={zoomEl}
	id="zoom-contrainer"
	role="presentation"
	class="flex h-full w-full select-none"
	style:scale={slideState.scale}
	style:translate="{translateX}px {translateY}px"
	onpointerdown={onPointerdown}
	onpointermove={onPointermove}
	onpointerup={onPointerup}
>
	{@render children()}
</section>
