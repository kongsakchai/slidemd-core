import { Processor } from 'unified'
import { addFromMarkdownExtensions, addMicromarkExtensions } from './helper'
import { highligh, highlightFromMarkdown } from './highlight'
import { subscript, subscriptFromMarkdown, superscript, superscriptFromMarkdown } from './subsuper'
import { htmlBlock } from './svelte_block'

export function slidemdParser(this: Processor) {
	addMicromarkExtensions(this, highligh(), subscript(), superscript(), htmlBlock())
	addFromMarkdownExtensions(this, highlightFromMarkdown(), subscriptFromMarkdown(), superscriptFromMarkdown())
}
