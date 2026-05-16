import stringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remark2Rehype from 'remark-rehype'
import { unified } from 'unified'

import { ignoreRender, slidemdParser } from './parsers/index.js'
import { Attribute, AttributeValue, Directive, TransformOptions, applyTransformers } from './transform/index.js'

export interface Options {
	transform?: TransformOptions
}

export interface File {
	value: string
	data: Directive
}

export type { Attribute, AttributeValue, Directive }

export function createParser(options?: Options) {
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

	return {
		parse: async (value: string, data: Directive): Promise<File> => {
			const file = await parser.process({ value: value, data: data })
			return {
				value: file.toString(),
				data: file.data as Directive
			}
		}
	}
}
