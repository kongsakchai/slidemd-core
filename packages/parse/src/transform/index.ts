import type { Root as MRoot } from 'mdast'
import { Processor } from 'unified'

import { transformerAttribute } from './attribute.js'
import { CodeblockOptions, transformerCodeblock } from './codeblock.js'
import { transformerDirective } from './directive.js'
import { transformerExteactScript } from './extract-script.js'

export interface TransformOptions {
	codeblock?: CodeblockOptions
}

export function applyTransformers(
	process: Processor<MRoot, MRoot, undefined, undefined, undefined>,
	options?: TransformOptions
) {
	process.use(transformerCodeblock, options?.codeblock)
	process.use(transformerAttribute)
	process.use(transformerExteactScript)
	process.use(transformerDirective)
}
