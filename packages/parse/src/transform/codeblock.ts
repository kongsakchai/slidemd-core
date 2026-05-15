import {
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationFocus,
	transformerNotationHighlight
} from '@shikijs/transformers'

import type { Element, ElementContent } from 'hast'
import type { Parent, Root, RootContent } from 'mdast'
import { SpecialLanguage, createHighlighter } from 'shiki'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import type { Transformer } from 'unified'
import { visit } from 'unist-util-visit'

import { getAttributes, mapNode } from './helper.js'
import { Attribute } from './types.js'

export interface CodeblockOptions {
	disableCopy?: boolean
	copyEventName?: string
}

const themes = {
	light: 'github-light',
	dark: 'github-dark'
}

const transformers = [
	transformerNotationDiff(),
	transformerNotationHighlight(),
	transformerNotationFocus(),
	transformerNotationErrorLevel()
]

const jsEngine = createJavaScriptRegexEngine()

const highlighter = await createHighlighter({
	langs: ['go', 'javascript', 'typescript', 'yaml', 'html', 'css', 'svelte', 'markdown', 'plaintext'],
	themes: ['github-light', 'github-dark'],
	engine: jsEngine
})

const escapeSpecialCharacters = (str: string) => {
	return str.replace(/[&<>{}]/g, (char) => `{'${char}'}`)
}

function createContainer(lang: string, attrs: Attribute, options?: CodeblockOptions) {
	attrs.class = [`language-${lang}`, attrs.class].filter(Boolean).join(' ')

	const copyEventName = options?.copyEventName ? `onclick="{${options?.copyEventName}}"` : ''
	const copyButton: ElementContent[] = options?.disableCopy
		? []
		: [{ type: 'raw', value: `<button id="code-copy-btn" class="copy" ${copyEventName}></button>` }]

	const container: Parent = {
		type: 'container',
		data: {
			hName: 'div',
			hProperties: attrs,
			hChildren: [...copyButton, { type: 'raw', value: `<span class="lang">${lang}</span>` }]
		},
		children: []
	}
	return container
}

function createMermaidContainer(attrs: Attribute) {
	const container: Parent = {
		type: 'container',
		data: {
			hName: 'div',
			hProperties: attrs,
			hChildren: []
		},
		children: []
	}
	return container
}

async function highlightCode(code: string, lang: string) {
	try {
		if (!highlighter.getLoadedLanguages().includes(lang)) {
			await highlighter.loadLanguage(lang as SpecialLanguage)
		}
	} catch {
		console.warn(`\x1b[43m\x1b[30m WARN \x1b[0m\x1b[33m Failed to load language: ${lang}`)
		lang = 'plaintext'
	}

	const hast = highlighter.codeToHast(code, {
		lang: lang,
		defaultColor: false,
		themes,
		transformers
	})

	visit(hast, 'text', (node) => {
		node.value = escapeSpecialCharacters(node.value)
	})

	return hast.children.pop()
}

async function mermaidBlock(code: string) {
	const container: Element = {
		type: 'element',
		tagName: 'pre',
		properties: {
			class: 'mermaid'
		},
		children: [{ type: 'text', value: escapeSpecialCharacters(code) }]
	}
	return container
}

export function transformerCodeblock(options?: CodeblockOptions): Transformer {
	return async (tree) => {
		const codeblocks = mapNode(tree as Root, 'code', (node, index, parent) => {
			if (typeof index !== 'number' || !parent) return

			const lang = node.lang || 'plaintext'
			const code = node.value
			const attrs = getAttributes(node.meta)

			const container = lang === 'mermaid' ? createMermaidContainer(attrs) : createContainer(lang, attrs, options)
			parent.children.splice(index, 1, container as RootContent)

			return {
				lang,
				code,
				container
			}
		})

		await Promise.all(
			codeblocks.map(async (block) => {
				if (!block) return
				const isMermaid = block.lang === 'mermaid'
				const html = isMermaid ? await mermaidBlock(block.code) : await highlightCode(block.code, block.lang)
				block.container.data?.hChildren?.push(html as ElementContent)
			})
		)
	}
}
