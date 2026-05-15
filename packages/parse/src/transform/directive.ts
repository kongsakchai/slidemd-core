/* eslint-disable @typescript-eslint/no-explicit-any */
import yaml from 'js-yaml'
import { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

export function transformerDirective(): Transformer {
	return (tree, vfile) => {
		visit(tree as Root, 'html', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			const match = /^<!--([\s\S]*)-->$/.exec(node.value)
			if (!match) return

			const val = match[1].trim()
			try {
				const directive = yaml.load(val) as Record<string, any>
				vfile.data = { ...vfile.data, ...directive }
			} catch {
				console.warn(`\x1b[43m\x1b[30m WARN \x1b[0m\x1b[33m directive syntax invalid:\x1b[0m\n---\n${val}\n---`)
				return
			}
		})
	}
}
