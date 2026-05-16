import { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'
import { parse } from 'yaml'

import { Directive } from './types'

export function transformerDirective(): Transformer {
	return (tree, vfile) => {
		visit(tree as Root, 'html', (node, index, parent) => {
			if (typeof index !== 'number' || !parent || parent != tree) return

			const match = /^<!--([\s\S]*)-->$/.exec(node.value)
			if (!match) return

			const val = match[1].trim()
			try {
				const directive = parse(val) as Directive
				vfile.data = { ...vfile.data, ...directive }

				parent.children.splice(index, 1)
				return index
			} catch (e) {
				console.warn(
					e,
					`\x1b[43m\x1b[30m WARN \x1b[0m\x1b[33m directive syntax invalid:\x1b[0m\n---\n${val}\n---`
				)
				return
			}
		})
	}
}
