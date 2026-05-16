import { type Directive, createParser } from '@slidemd/parse'

import yaml from 'js-yaml'
import MagicString from 'magic-string'
import type { PreprocessorGroup } from 'svelte/compiler'

import { asNumber, asString, makeSlideDirective, resolveDirectives } from './helper'
import type { Options, SlideContent, SlideData, SlidePageStore } from './types.js'

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
		const slides: SlideContent[] = []

		let scriptTag = ''
		let styleTag = ''
		let sharedDirective = { ...metadata }

		for (const [i, page] of pages.entries()) {
			const file = await parser.parse(page, { ...sharedDirective, index: i + 1 })
			const { local, shared } = resolveDirectives(file.data)
			sharedDirective = shared

			slides.push({
				page: i + 1,
				note: asString(local.note),
				step: asNumber(local.step, 0),
				directive: local,
				content: file.value
			})

			scriptTag = asString(shared.scriptTag, scriptTag)
			styleTag = asString(shared.styleTag, styleTag)

			// clear unshare directive
			shared.step = undefined
			shared.note = undefined
			shared.scriptTag = undefined
			shared.styleTag = undefined
		}

		return { slides, metadata, script: scriptTag, style: styleTag }
	}

	const toSvelte = async (markdown: string) => {
		const { slides, metadata, script, style } = await parse(markdown)

		const slideData: SlideData = {
			...metadata,
			title: metadata.title?.toString() || 'slidemd',
			pages: [],
			markdown
		}

		const store: SlidePageStore = { page: 0 }
		const contents = slides.map((slide) => {
			slideData.pages.push({ page: slide.page, step: slide.step, note: slide.note })

			const directive = makeSlideDirective(slide.directive, store)

			return [
				`<section class='slide ${directive.class}' style='${directive.style}' data-page='${slide.page}' hidden='{page !== ${slide.page}}'>`,
				directive.background,
				directive.page,
				slide.content,
				`</section>`
			].join('\n')
		})

		const styles = style
			? [
					'<style lang="postcss">',
					'@reference "tailwindcss";',
					'@reference "@slidemd/slidemd/themes/slidemd.css";',
					style,
					'</style>'
				]
			: []

		const component = [
			`<script lang="ts" module>`,
			`export const slide = ` + JSON.stringify(slideData),
			`</script>`,
			'<script lang="ts">',
			"import {copyCode} from '@slidemd/slidemd/shared'",
			'let { page=$bindable() } = $props()',
			script,
			'</script>',
			...contents,
			...styles
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
