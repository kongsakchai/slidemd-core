import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import type { Extension as MicromarkExtension } from 'micromark-util-types'
import { Processor } from 'unified'

export const addMicromarkExtensions = (p: Processor, ...extensions: MicromarkExtension[]) => {
	const data = p.data() as { micromarkExtensions?: MicromarkExtension[] }
	const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = [])
	micromarkExtensions.push(...extensions)
}

export const addFromMarkdownExtensions = (p: Processor, ...extensions: FromMarkdownExtension[]) => {
	const data = p.data() as { fromMarkdownExtensions?: Array<FromMarkdownExtension[] | FromMarkdownExtension> }
	const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = [])
	fromMarkdownExtensions.push(...extensions)
}
