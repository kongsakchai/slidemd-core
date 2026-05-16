declare module '*.md' {
	import type { SlideData, SlideMDComponent } from '@slidemd/slidemd/types'

	export const slide: SlideData

	const Component: SlideMDComponent
	export default Component
}
