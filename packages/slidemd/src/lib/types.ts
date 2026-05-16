import type { Directive } from '@slidemd/parse'

// Lib
export interface Options {
	extension?: string
}

// Parser
export interface SlideInfo {
	slides: SlideContent[]
	metadata: Record<string, string | boolean | number>
	script: string
	style: string
}

export interface SlideContent extends SlidePageData {
	content: string
	directive: Directive
}

export interface SlideDirective {
	class: string
	style: string
	page: string
	footer: string
	header: string
	background: string
}

export interface SlidePageStore {
	page: number
}

// Component
export type SlideMDComponent = import('svelte').Component<SlideProps>

export interface SlideProps {
	page: number
	step: number
}

export interface SlideData {
	title: string
	pages: SlidePageData[]
	[key: string]: Directive[string] | SlidePageData[]
}

export interface SlidePageData {
	page: number
	note?: string
	step: number
}
