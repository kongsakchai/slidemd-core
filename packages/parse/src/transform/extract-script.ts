import type { Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

const rawTagExpression = /^<(script|style)(?:\s[\s\S]*)?>([\s\S]*)<\/\1>$/i

export function transformerExteactScript(): Transformer {
	return async (tree, vfile) => {
		visit(tree as Root, 'html', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			const match = rawTagExpression.exec(node.value)
			if (!match) return

			switch (match[1].toLowerCase()) {
				case 'script':
					vfile.data.scriptTag = match[2]
					break
				case 'style':
					vfile.data.styleTag = match[2]
					break
			}

			parent.children.splice(index, 1)
			return index
		})
	}
}
