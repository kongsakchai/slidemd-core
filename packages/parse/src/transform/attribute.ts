import { Data, Root } from 'mdast'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { getAttributes } from './helper.js'

export function transformerAttribute(): Transformer {
	return (tree, vfile) => {
		visit(tree as Root, 'attribute', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return
			if (index != parent.children.length - 1) return

			const attrs = getAttributes(node.value)
			parent.data = { ...parent.data }
			parent.data.hProperties = {
				...parent.data.hProperties,
				...(attrs as Data['hProperties'])
			}
			parent.children.pop()

			const step = attrs.step ?? 0
			vfile.data.step = typeof vfile.data.step === 'number' ? Math.max(step, vfile.data.step) : step
		})
	}
}
