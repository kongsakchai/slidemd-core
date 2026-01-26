import { Processor } from 'unified'
import { addFromMarkdownExtensions, addMicromarkExtensions } from './helper'
import { highligh, highlightFromMarkdown } from './highlight'
import { htmlBlock } from './html_block'
import { logicBlock } from './logic_block'
import { subscript, subscriptFromMarkdown, superscript, superscriptFromMarkdown } from './subsuper'

export function slidemdParser(this: Processor) {
	addMicromarkExtensions(this, highligh(), subscript(), superscript(), htmlBlock(), logicBlock())
	addFromMarkdownExtensions(this, highlightFromMarkdown(), subscriptFromMarkdown(), superscriptFromMarkdown())
}
