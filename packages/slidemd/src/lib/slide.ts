/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Directive, createParser } from '@slidemd/parse'

import yaml from 'js-yaml'
import MagicString from 'magic-string'
import type { PreprocessorGroup } from 'svelte/compiler'

import type { Content, Options, SlideData } from './types.js'

export function extractFrontmatter(markdown: string) {
	const match = /^---\r?\n([\s\S]*?)---/.exec(markdown)
	if (!match) return { body: markdown, metadata: {} }

	// match[1] contains the frontmatter content
	const metadata = yaml.load(match[1]) as Directive
	// match[0] contains the entire match including the frontmatter
	const body = markdown.slice(match[0].length)

	return { body, metadata }
}

export function slidemd(options?: Options): PreprocessorGroup {
	const parser = createParser({
		transform: {
			codeblock: {
				copyEventName: 'copyCode'
			}
		}
	})

	const parse = async (markdown: string) => {
		const { body, metadata } = extractFrontmatter(markdown)

		const pages = body.split(/\r?\n---\r?\n/)
		const directive = { ...metadata }
		const slides: Content[] = []

		for (const [i, page] of pages.entries()) {
			directive.page = i + 1
			directive.step = 0
			directive.note = undefined

			const file = await parser.parse({ value: page, data: directive })

			slides.push({
				page: i + 1,
				note: directive.note,
				step: directive.step,
				content: file.toString()
			})
		}

		return { slides, metadata, script: directive.script, style: directive.style }
	}

	const toSvelte = async (markdown: string) => {
		const { slides, metadata, script } = await parse(markdown)

		const pageData: SlideData = { ...metadata, title: metadata.title as string, pages: [], markdown }

		const contents = slides.map((slide) => {
			pageData.pages.push({ page: slide.page, step: slide.step, note: slide.note })
			return [
				`<section class="slide" data-page="${slide.page}" hidden="{page !== ${slide.page}}">`,
				slide.content,
				`</section>`
			].join('\n')
		})

		const component = [
			`<script lang="ts" module>`,
			`export const slide = ` + JSON.stringify(pageData),
			`</script>`,
			'<script lang="ts">',
			"import {copyCode} from '@slidemd/slidemd/utils'",
			script,
			'let { page=$bindable() } = $props()',
			'</script>',
			...contents
		]

		return component.join('\n')
	}

	return {
		name: 'slidemd',
		markup: async ({ content, filename }) => {
			if (filename?.endsWith(options?.extension || '.md')) {
				const result = new MagicString(content)
				const parsed = await toSvelte(content)

				result.update(0, content.length - 1, String(parsed))
				return {
					code: result.toString(),
					map: result.generateMap()
				}
			}
		}
	}
}
