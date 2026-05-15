import type { Event, TokenizeContext } from 'micromark-util-types'
import stringify from 'rehype-stringify'
import remarkGemoji from 'remark-gemoji'
import remarkGfm from 'remark-gfm'
import markdown from 'remark-parse'
import remark2Rehype from 'remark-rehype'
import { unified } from 'unified'
import { describe, expect, it } from 'vitest'

import { ignoreRender, slidemdParser } from '../src/parsers'
import { addFromMarkdownExtensions, addMicromarkExtensions, handleResolveAll } from '../src/parsers/helper'
import { highlight, highlightFromMarkdown } from '../src/parsers/highlight'

const setupProcessorTestParser = () => {
	const mdastTransform = unified()
		.use(markdown)
		.use(remarkGemoji)
		.use(remarkGfm, { singleTilde: false })
		.use(slidemdParser)

	const hastTransform = mdastTransform.use(remark2Rehype, {
		handlers: ignoreRender(),
		allowDangerousHtml: true
		// allowDangerousCharacters: true
	})

	const processor = hastTransform.use(stringify, {
		allowDangerousHtml: true
		// allowDangerousCharacters: true
	})

	return processor
}

describe('basic syntax', () => {
	describe('header', () => {
		it('should return one line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('# Header1')
			expect(file.value).toEqual('<h1>Header1</h1>')
		})

		it('should return multiple line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('# Header1\n ## Header2')
			expect(file.value).toEqual('<h1>Header1</h1>\n<h2>Header2</h2>')
		})
	})

	describe('paragraph', () => {
		it('should return one line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('hello, markdown')
			expect(file.value).toEqual('<p>hello, markdown</p>')
		})

		it('should return multiple line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('hello, markdown\nhello, remark')
			expect(file.value).toEqual('<p>hello, markdown\nhello, remark</p>')
		})

		it('should return multiple paragraph', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('hello, markdown\n\nhello, remark')
			expect(file.value).toEqual('<p>hello, markdown</p>\n<p>hello, remark</p>')
		})

		it('should return bold', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('**hello, markdown**')
			expect(file.value).toEqual('<p><strong>hello, markdown</strong></p>')
		})

		it('should return italic', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('*hello, markdown*')
			expect(file.value).toEqual('<p><em>hello, markdown</em></p>')
		})
	})

	describe('blockquote', () => {
		it('should return one line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('>hello, markdown')
			expect(file.value).toEqual('<blockquote>\n<p>hello, markdown</p>\n</blockquote>')
		})

		it('should return multiple line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('> hello, markdown\nhello, remark\n> hello, svelte')
			expect(file.value).toEqual(
				'<blockquote>\n<p>hello, markdown\nhello, remark\nhello, svelte</p>\n</blockquote>'
			)
		})

		it('should return multiple line and paragraph', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('> hello, markdown\n>\n>hello, remark')
			expect(file.value).toEqual('<blockquote>\n<p>hello, markdown</p>\n<p>hello, remark</p>\n</blockquote>')
		})
	})

	describe('order list', () => {
		it('should return one line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('1. first items')
			expect(file.value).toEqual('<ol>\n<li>first items</li>\n</ol>')
		})

		it('should return multiple line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('1. first items\n2.invalid fromat\n2. second items')
			expect(file.value).toEqual('<ol>\n<li>first items\n2.invalid fromat</li>\n<li>second items</li>\n</ol>')
		})
	})

	describe('unorder list', () => {
		it('should return one line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('- first items')
			expect(file.value).toEqual('<ul>\n<li>first items</li>\n</ul>')
		})

		it('should return multiple line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('- first items\n-invalid fromat\n- second items')
			expect(file.value).toEqual('<ul>\n<li>first items\n-invalid fromat</li>\n<li>second items</li>\n</ul>')
		})
	})

	describe('code', () => {
		it('should return code', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('`hello, markdown`')
			expect(file.value).toEqual('<p><code>hello, markdown</code></p>')
		})
	})

	describe('horizontal line', () => {
		it('should return horizontal line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('---')
			expect(file.value).toEqual('<hr>')

			const file2 = await processor.process('------')
			expect(file2.value).toEqual('<hr>')
		})
	})

	describe('link', () => {
		it('should return one line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('[title](https://www.example.com)')
			expect(file.value).toEqual('<p><a href="https://www.example.com">title</a></p>')
		})

		it('should return multiple line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('[title](https://www.example.com)\n[title](https://www.example.com)')
			expect(file.value).toEqual(
				'<p><a href="https://www.example.com">title</a>\n<a href="https://www.example.com">title</a></p>'
			)
		})

		it('should return quickly', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('<https://www.example.com>')
			expect(file.value).toEqual('<p><a href="https://www.example.com">https://www.example.com</a></p>')
		})
	})

	describe('image', () => {
		it('should return one line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('![alt](https://www.example.com "title")')
			expect(file.value).toEqual('<p><img src="https://www.example.com" alt="alt" title="title"></p>')
		})

		it('should return multiple line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('![alt](https://www.example.com)\n![alt](https://www.example.com)')
			expect(file.value).toEqual(
				'<p><img src="https://www.example.com" alt="alt">\n<img src="https://www.example.com" alt="alt"></p>'
			)
		})

		it('should return multiple line and paragraph', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('![alt](https://www.example.com)\n\n![alt](https://www.example.com)')
			expect(file.value).toEqual(
				'<p><img src="https://www.example.com" alt="alt"></p>\n<p><img src="https://www.example.com" alt="alt"></p>'
			)
		})
	})
})

describe('extended syntax', () => {
	describe('table', () => {
		it('should return table', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('| Col 1 | Col 2 |\n| - | - |')
			expect(file.value).toEqual(
				'<table>\n<thead>\n<tr>\n<th>Col 1</th>\n<th>Col 2</th>\n</tr>\n</thead>\n</table>'
			)
		})

		it('should return table with align', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('| Col 1 | Col 2 |\n| -: | :-: |')
			expect(file.value).toEqual(
				'<table>\n<thead>\n<tr>\n<th align="right">Col 1</th>\n<th align="center">Col 2</th>\n</tr>\n</thead>\n</table>'
			)
		})
	})

	describe('fenced code blocks', () => {
		it('should return without lang', async () => {
			const code = '```\nconsole.log("hello, markdown")\n````'

			const processor = setupProcessorTestParser()

			const file = await processor.process(code)
			expect(file.value).toEqual('<pre><code>console.log("hello, markdown")\n</code></pre>')
		})

		it('should return with lang', async () => {
			const code = '```js\nconsole.log("hello, markdown")\n````'

			const processor = setupProcessorTestParser()

			const file = await processor.process(code)
			expect(file.value).toEqual('<pre><code class="language-js">console.log("hello, markdown")\n</code></pre>')
		})
	})

	describe('task list', () => {
		it('should return paragraph when wrong format', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('-[] first items\n- [] second items')
			expect(file.value).toEqual('<p>-[] first items</p>\n<ul>\n<li>[] second items</li>\n</ul>')
		})

		it('should return task list', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('- [ ] first items\n- [x] second items')
			expect(file.value).toEqual(
				'<ul class="contains-task-list">\n<li class="task-list-item"><input type="checkbox" disabled> first items</li>\n<li class="task-list-item"><input type="checkbox" checked disabled> second items</li>\n</ul>'
			)
		})
	})

	describe('more', () => {
		it('should return footnote', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('Hello, markdown[^1]\n\n[^1]: Hello, markdown.')
			expect(file.value).include(
				'<p>Hello, markdown<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref aria-describedby="footnote-label">1</a></sup></p>'
			)
		})

		it('should return strikethrough', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('~~strikethrough text~~ normal text')
			expect(file.value).toEqual('<p><del>strikethrough text</del> normal text</p>')
		})

		it('should return emoji', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process(':tada: :rocket: :seedling:')
			expect(file.value).toEqual('<p>🎉 🚀 🌱</p>')
		})

		it('should return highlight', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process(`hello, ==markdown==`)
			expect(file.value).toEqual('<p>hello, <mark>markdown</mark></p>')

			// file = await processor.process(`hello, ===markdown===`)
			// expect(file.value).toEqual('<p>hello, ===markdown===</p>')

			// file = await processor.process(`hello, ==\nmarkdown==`)
			// expect(file.value).toEqual('<p>hello, <mark>\nmarkdown</mark></p>')
		})

		it('should return highlight with other syntax', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process(`hello, ==*markdown*==`)
			expect(file.value).toEqual('<p>hello, <mark><em>markdown</em></mark></p>')
		})

		it('should return normal text when escape highligh', async () => {
			const processor = setupProcessorTestParser()

			let file = await processor.process(`hello, =\\==markdown===`)
			expect(file.value).toEqual('<p>hello, ===markdown===</p>')

			file = await processor.process(`hello, ==\\=markdown==`)
			expect(file.value).toEqual('<p>hello, <mark>=markdown</mark></p>')

			file = await processor.process(`hello, \\==markdown==`)
			expect(file.value).toEqual('<p>hello, ==markdown==</p>')
		})

		it('should return subscript', async () => {
			const processor = setupProcessorTestParser()

			let file = await processor.process('h~2~o')
			expect(file.value).toEqual('<p>h<sub>2</sub>o</p>')

			file = await processor.process('`h~2~o`')
			expect(file.value).toEqual('<p><code>h~2~o</code></p>')

			file = await processor.process('h~~~2~~~o')
			expect(file.value).toEqual('<p>h~~~2~~~o</p>')

			file = await processor.process('h~2o')
			expect(file.value).toEqual('<p>h~2o</p>')
		})

		it('should return superscript', async () => {
			const processor = setupProcessorTestParser()

			let file = await processor.process('h^2^o')
			expect(file.value).toEqual('<p>h<sup>2</sup>o</p>')

			file = await processor.process('`h^2^o`')
			expect(file.value).toEqual('<p><code>h^2^o</code></p>')

			file = await processor.process('h^^2^^o')
			expect(file.value).toEqual('<p>h^^2^^o</p>')

			file = await processor.process('h^2o')
			expect(file.value).toEqual('<p>h^2o</p>')
		})
	})
})

describe('svelte syntax', () => {
	describe('basic html', () => {
		it('should return div tag', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('<div>hello, markdown</div>')
			expect(file.value).toEqual('<div>hello, markdown</div>')
		})

		it('should return div with attr', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('<div class="bg-primary">hello, markdown</div>')
			expect(file.value).toEqual('<div class="bg-primary">hello, markdown</div>')
		})

		it('should return div with data', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('<div class="{class}">hello, {name.toUpperCase()}</div>')
			expect(file.value).toEqual('<div class="{class}">hello, {name.toUpperCase()}</div>')
		})

		it('should return div without contents', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('<div />')
			expect(file.value).toEqual('<div />')
		})

		it('should return div with multiple line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('<div>\nhello, markdown\n\n# hello, remark\n\n</div>')
			expect(file.value).toEqual('<div>\nhello, markdown\n\n# hello, remark\n\n</div>')
		})

		it('should return div with multiple line in attributes', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('<div\nclass="bg-primary"\n>hello, markdown</div>')
			expect(file.value).toEqual('<div\nclass="bg-primary"\n>hello, markdown</div>')
		})

		it('should return raw', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('<script lang="ts" module>\nlet count = $state(0);\n</script>')
			expect(file.value).toEqual('<script lang="ts" module>\nlet count = $state(0);\n</script>')
		})

		it('should return html comment', async () => {
			const processor = setupProcessorTestParser()

			let file = await processor.process('<!-- \nhello, world\n -->')
			expect(file.value).toEqual('<!-- \nhello, world\n -->')

			file = await processor.process('<! -- -->')
			expect(file.value).toEqual('<p>&#x3C;! -- --></p>')

			file = await processor.process('<!- -->')
			expect(file.value).toEqual('<p>&#x3C;!- --></p>')

			file = await processor.process('<!-- ->')
			expect(file.value).toEqual('<!-- ->')
		})

		it('should return instrcutions', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('<?php \n?\n?\n ?>')
			expect(file.value).toEqual('<?php \n?\n?\n ?>')
		})

		it('should return cdata', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('<!DOCUMENT test>')
			expect(file.value).toEqual('<!DOCUMENT test>')
		})

		it('should return cdata', async () => {
			const processor = setupProcessorTestParser()

			let file = await processor.process('<![CDATA[ \n]\n]]\n ]]>')
			expect(file.value).toEqual('<![CDATA[ \n]\n]]\n ]]>')

			file = await processor.process('<![CDAT[ \n]\n]]\n ]]>')
			expect(file.value).toEqual('<p>&#x3C;![CDAT[\n]\n]]\n]]></p>')

			file = await processor.process('<![CDAT[')
			expect(file.value).toEqual('<p>&#x3C;![CDAT[</p>')
		})

		it('inline html', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('# hello <img src={src} />')
			expect(file.value).toEqual('<h1>hello <img src={src} /></h1>')
		})

		it('inline html with multiple line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('hello <img\nsrc={src} />')
			expect(file.value).toEqual('<p>hello <img\nsrc={src} /></p>')
		})

		it('should return invalid html', async () => {
			const processor = setupProcessorTestParser()

			let file = await processor.process('<@div>hello, markdown<$div>')
			expect(file.value).toEqual('<p>&#x3C;@div>hello, markdown&#x3C;$div></p>')

			file = await processor.process('<div>hello, markdown</invalid>')
			expect(file.value).toEqual('<div>hello, markdown</invalid>')

			file = await processor.process('<>hello, markdown</>')
			expect(file.value).toEqual('<p>&#x3C;>hello, markdown&#x3C;/></p>')
		})

		it('should return multiple tag', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('<div><img /></div>')
			expect(file.value).toEqual('<div><img /></div>')

			const file2 = await processor.process('<div><div>555</div></div>')
			expect(file2.value).toEqual('<div><div>555</div></div>')
		})

		it('should return autolink', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('<http://www.google.com>')
			expect(file.value).toEqual('<p><a href="http://www.google.com">http://www.google.com</a></p>')

			const file2 = await processor.process('<https://svelte.dev/>')
			expect(file2.value).toEqual('<p><a href="https://svelte.dev/">https://svelte.dev/</a></p>')
		})
	})

	describe('basic svelte', () => {
		it('should return image src', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('<img src={src} alt="{name} dances." />')
			expect(file.value).toEqual('<img src={src} alt="{name} dances." />')
		})

		it('should return image shorthand src', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('<img {src} alt="{name} dances." />')
			expect(file.value).toEqual('<img {src} alt="{name} dances." />')
		})

		it('should return inline image shorthand src', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('# title <img {src} alt="{name} dances." />')
			expect(file.value).toEqual('<h1>title <img {src} alt="{name} dances." /></h1>')
		})

		it('should return html block', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('{@html variable}')
			expect(file.value).toEqual('{@html variable}')
		})

		it('should return inline html block', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('hello {@html variable} markdown')
			expect(file.value).toEqual('<p>hello {@html variable} markdown</p>')
		})

		it('should return inline html block in two line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('hello {@html \nvariable} markdown')
			expect(file.value).toEqual('<p>hello {@html \nvariable} markdown</p>')
		})

		it('should return inline html block and multiple line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('hello {@html \n\nvariable} markdown')
			expect(file.value).toEqual('<p>hello {@html</p>\n<p>variable} markdown</p>')
		})

		it('should return if block', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('{#if data}')
			expect(file.value).toEqual('{#if data}')
		})

		it('should return if block with multiple line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('{#if \n\n\ndata \n\n\n}')
			expect(file.value).toEqual('{#if \n\n\ndata \n\n\n}')
		})

		it('should return if block with header', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('{#if data}\n# header1\n## header2\n### header3\n{/if}')
			expect(file.value).toEqual('{#if data}\n<h1>header1</h1>\n<h2>header2</h2>\n<h3>header3</h3>\n{/if}')
		})

		it('should return paragraph and variable', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('{variable}')
			expect(file.value).toEqual('{variable}')
		})

		it('should return paragraph and ternary', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('Age is: {variable >= 0 ? "\\"OLD\\"":"YOUNG"}')
			expect(file.value).toEqual('<p>Age is: {variable >= 0 ? "\\"OLD\\"":"YOUNG"}</p>')
		})

		it('should return logic with multiple line', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('Age is: {variable >= 0 \n?\n""OLD""\n:"YOUNG"}')
			expect(file.value).toEqual('<p>Age is: {variable >= 0 \n?\n""OLD""\n:"YOUNG"}</p>')
		})

		it('should return logic if inline ', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('Age is: {#if variable}')
			expect(file.value).toEqual('<p>Age is: {#if variable}</p>')
		})

		it('should return logic with multiple left curly brace', async () => {
			const processor = setupProcessorTestParser()

			const file = await processor.process('Age is: {{data:10}}')
			expect(file.value).toEqual('<p>Age is: {{data:10}}</p>')
		})
	})
})

describe('helper parsers', () => {
	it("should new micromarkExtensions when it's empty", () => {
		const processor = unified()
		processor.data().micromarkExtensions = undefined

		addMicromarkExtensions(processor, highlight())
		expect(processor.data().micromarkExtensions).toBeDefined()
		expect(processor.data().micromarkExtensions).toHaveLength(1)
	})

	it('should add micromarkExtensions to existing one', () => {
		const processor = unified()
		processor.data().fromMarkdownExtensions = undefined

		addFromMarkdownExtensions(processor, highlightFromMarkdown())
		expect(processor.data().fromMarkdownExtensions).toBeDefined()
		expect(processor.data().fromMarkdownExtensions).toHaveLength(1)
	})

	it('should add original events when construct is undefined', () => {
		const event: Event[] = []
		const resp = handleResolveAll(undefined, event, {} as TokenizeContext)
		expect(resp).toEqual(event)
	})
})

describe('attribute syntax', () => {
	it('should return only content when attribute parser correctly', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('# hello, markdown @{.title} ')
		expect(file.value).toEqual('<h1>hello, markdown </h1>')
	})

	it('should return all and attribute text when attribute not last token', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('# hello, markdown @{.title} text')
		expect(file.value).toEqual('<h1>hello, markdown @{.title} text</h1>')
	})

	it('should return all when attribute invalid', async () => {
		const processor = setupProcessorTestParser()

		const file = await processor.process('# hello, markdown @{.title')
		expect(file.value).toEqual('<h1>hello, markdown @{.title</h1>')
	})
})
