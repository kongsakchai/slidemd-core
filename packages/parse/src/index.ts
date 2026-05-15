import type { Root as HRoot } from 'hast'
import type { Root as MRoot } from 'mdast'
import stringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remark2Rehype from 'remark-rehype'
import { Processor, unified } from 'unified'

import { ignoreRender, slidemdParser } from './parsers/index.js'
import { TransformOptions, applyTransformers } from './transform/index.js'

export interface Options {
	transform?: TransformOptions
}

export type Parser = Processor<MRoot, MRoot, HRoot, HRoot, string>

export function createParser(options?: Options): Parser {
	const mdastTransform = unified()
		.use(markdown)
		.use(remarkGemoji)
		.use(remarkGfm, { singleTilde: false })
		.use(slidemdParser)

	applyTransformers(mdastTransform, options?.transform)

	const hastTransform = mdastTransform.use(remark2Rehype, {
		handles: ignoreRender(),
		allowDangerousHtml: true
	})

	const parser = hastTransform.use(stringify, {
		allowDangerousHtml: true
	})

	return parser
}
