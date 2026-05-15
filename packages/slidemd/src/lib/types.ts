// Lib
export interface Options {
	extension?: string
}

// Parser
export interface SlideInfo {
	slides: Content[]
	metadata: Record<string, string | boolean | number>
	script: string
	style: string
}

export interface Content extends PageData {
	content: string
}

// Component
export type SlideMDComponent = import('svelte').Component<SlideProps>

export interface SlideProps {
	page: number
	step: number
}

export interface SlideData {
	title: string
	pages: PageData[]
	markdown: string
	[key: string]: string | boolean | number | object
}

export interface PageData {
	page: number
	note?: string
	step: number
}
