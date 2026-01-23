import { describe, expect, it } from 'vitest'
import { initProcessor } from '../src'

describe('basic syntax', () => {
	describe('header', () => {
		it('should return one line', async () => {
			const processor = initProcessor()

			const file = await processor.process('# Header1')
			expect(file.value).toEqual('<h1>Header1</h1>')
		})

		it('should return multiple line', async () => {
			const processor = initProcessor()

			const file = await processor.process('# Header1\n ## Header2')
			expect(file.value).toEqual('<h1>Header1</h1>\n<h2>Header2</h2>')
		})
	})

	describe('paragraph', () => {
		it('should return one line', async () => {
			const processor = initProcessor()

			const file = await processor.process('hello, markdown')
			expect(file.value).toEqual('<p>hello, markdown</p>')
		})

		it('should return multiple line', async () => {
			const processor = initProcessor()

			const file = await processor.process('hello, markdown\nhello, remark')
			expect(file.value).toEqual('<p>hello, markdown\nhello, remark</p>')
		})

		it('should return multiple paragraph', async () => {
			const processor = initProcessor()

			const file = await processor.process('hello, markdown\n\nhello, remark')
			expect(file.value).toEqual('<p>hello, markdown</p>\n<p>hello, remark</p>')
		})

		it('should return bold', async () => {
			const processor = initProcessor()

			const file = await processor.process('**hello, markdown**')
			expect(file.value).toEqual('<p><strong>hello, markdown</strong></p>')
		})

		it('should return italic', async () => {
			const processor = initProcessor()

			const file = await processor.process('*hello, markdown*')
			expect(file.value).toEqual('<p><em>hello, markdown</em></p>')
		})
	})

	describe('blockquote', () => {
		it('should return one line', async () => {
			const processor = initProcessor()

			const file = await processor.process('>hello, markdown')
			expect(file.value).toEqual('<blockquote>\n<p>hello, markdown</p>\n</blockquote>')
		})

		it('should return multiple line', async () => {
			const processor = initProcessor()

			const file = await processor.process('> hello, markdown\nhello, remark\n> hello, svelte')
			expect(file.value).toEqual(
				'<blockquote>\n<p>hello, markdown\nhello, remark\nhello, svelte</p>\n</blockquote>'
			)
		})

		it('should return multiple line and paragraph', async () => {
			const processor = initProcessor()

			const file = await processor.process('> hello, markdown\n>\n>hello, remark')
			expect(file.value).toEqual('<blockquote>\n<p>hello, markdown</p>\n<p>hello, remark</p>\n</blockquote>')
		})
	})

	describe('order list', () => {
		it('should return one line', async () => {
			const processor = initProcessor()

			const file = await processor.process('1. first items')
			expect(file.value).toEqual('<ol>\n<li>first items</li>\n</ol>')
		})

		it('should return multiple line', async () => {
			const processor = initProcessor()

			const file = await processor.process('1. first items\n2.invalid fromat\n2. second items')
			expect(file.value).toEqual('<ol>\n<li>first items\n2.invalid fromat</li>\n<li>second items</li>\n</ol>')
		})
	})

	describe('unorder list', () => {
		it('should return one line', async () => {
			const processor = initProcessor()

			const file = await processor.process('- first items')
			expect(file.value).toEqual('<ul>\n<li>first items</li>\n</ul>')
		})

		it('should return multiple line', async () => {
			const processor = initProcessor()

			const file = await processor.process('- first items\n-invalid fromat\n- second items')
			expect(file.value).toEqual('<ul>\n<li>first items\n-invalid fromat</li>\n<li>second items</li>\n</ul>')
		})
	})

	describe('code', () => {
		it('should return code', async () => {
			const processor = initProcessor()

			const file = await processor.process('`hello, markdown`')
			expect(file.value).toEqual('<p><code>hello, markdown</code></p>')
		})
	})

	describe('horizontal line', () => {
		it('should return horizontal line', async () => {
			const processor = initProcessor()

			const file = await processor.process('---')
			expect(file.value).toEqual('<hr>')

			const file2 = await processor.process('------')
			expect(file2.value).toEqual('<hr>')
		})
	})

	describe('link', () => {
		it('should return one line', async () => {
			const processor = initProcessor()

			const file = await processor.process('[title](https://www.example.com)')
			expect(file.value).toEqual('<p><a href="https://www.example.com">title</a></p>')
		})

		it('should return multiple line', async () => {
			const processor = initProcessor()

			const file = await processor.process('[title](https://www.example.com)\n[title](https://www.example.com)')
			expect(file.value).toEqual(
				'<p><a href="https://www.example.com">title</a>\n<a href="https://www.example.com">title</a></p>'
			)
		})

		it('should return quickly', async () => {
			const processor = initProcessor()

			const file = await processor.process('<https://www.example.com>')
			expect(file.value).toEqual('<p><a href="https://www.example.com">https://www.example.com</a></p>')
		})
	})

	describe('image', () => {
		it('should return one line', async () => {
			const processor = initProcessor()

			const file = await processor.process('![alt](https://www.example.com "title")')
			expect(file.value).toEqual('<p><img src="https://www.example.com" alt="alt" title="title"></p>')
		})

		it('should return multiple line', async () => {
			const processor = initProcessor()

			const file = await processor.process('![alt](https://www.example.com)\n![alt](https://www.example.com)')
			expect(file.value).toEqual(
				'<p><img src="https://www.example.com" alt="alt">\n<img src="https://www.example.com" alt="alt"></p>'
			)
		})

		it('should return multiple line and paragraph', async () => {
			const processor = initProcessor()

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
			const processor = initProcessor()

			const file = await processor.process('| Col 1 | Col 2 |\n| - | - |')
			expect(file.value).toEqual(
				'<table>\n<thead>\n<tr>\n<th>Col 1</th>\n<th>Col 2</th>\n</tr>\n</thead>\n</table>'
			)
		})

		it('should return table with align', async () => {
			const processor = initProcessor()

			const file = await processor.process('| Col 1 | Col 2 |\n| -: | :-: |')
			expect(file.value).toEqual(
				'<table>\n<thead>\n<tr>\n<th align="right">Col 1</th>\n<th align="center">Col 2</th>\n</tr>\n</thead>\n</table>'
			)
		})
	})

	describe('fenced code blocks', () => {
		it('should return without lang', async () => {
			let code = '```\nconsole.log("hello, markdown")\n````'

			const processor = initProcessor()

			const file = await processor.process(code)
			expect(file.value).toEqual('<pre><code>console.log("hello, markdown")\n</code></pre>')
		})

		it('should return with lang', async () => {
			let code = '```js\nconsole.log("hello, markdown")\n````'

			const processor = initProcessor()

			const file = await processor.process(code)
			expect(file.value).toEqual('<pre><code class="language-js">console.log("hello, markdown")\n</code></pre>')
		})
	})

	describe('task list', () => {
		it('should return paragraph when wrong format', async () => {
			const processor = initProcessor()

			const file = await processor.process('-[] first items\n- [] second items')
			expect(file.value).toEqual('<p>-[] first items</p>\n<ul>\n<li>[] second items</li>\n</ul>')
		})

		it('should return task list', async () => {
			const processor = initProcessor()

			const file = await processor.process('- [ ] first items\n- [x] second items')
			expect(file.value).toEqual(
				'<ul class="contains-task-list">\n<li class="task-list-item"><input type="checkbox" disabled> first items</li>\n<li class="task-list-item"><input type="checkbox" checked disabled> second items</li>\n</ul>'
			)
		})
	})

	describe('more', () => {
		it('should return footnote', async () => {
			const processor = initProcessor()

			const file = await processor.process('Hello, markdown[^1]\n\n[^1]: Hello, markdown.')
			expect(file.value).include(
				'<p>Hello, markdown<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref aria-describedby="footnote-label">1</a></sup></p>'
			)
		})

		it('should return strikethrough', async () => {
			const processor = initProcessor()

			const file = await processor.process('~~strikethrough text~~ normal text')
			expect(file.value).toEqual('<p><del>strikethrough text</del> normal text</p>')
		})

		it('should return emoji', async () => {
			const processor = initProcessor()

			const file = await processor.process(':tada: :rocket: :seedling:')
			expect(file.value).toEqual('<p>🎉 🚀 🌱</p>')
		})

		it('should return highlight', async () => {
			const processor = initProcessor()

			const file = await processor.process(`hello, ==markdown==`)
			expect(file.value).toEqual('<p>hello, <mark>markdown</mark></p>')

			const filefail = await processor.process(`hello, =\\==markdown==`)
			expect(filefail.value).toEqual('<p>hello, ===markdown==</p>')

			const filefail2 = await processor.process(`hello, ==\\=markdown==`)
			expect(filefail2.value).toEqual('<p>hello, <mark>=markdown</mark></p>')
		})

		it('should return subscript', async () => {
			const processor = initProcessor()

			const file = await processor.process('h~2~o')
			expect(file.value).toEqual('<p>h<sub>2</sub>o</p>')
		})

		it('should return superscript', async () => {
			const processor = initProcessor()

			const file = await processor.process('h^2^o')
			expect(file.value).toEqual('<p>h<sup>2</sup>o</p>')
		})

		it('should return superscript in code', async () => {
			const processor = initProcessor()

			const file = await processor.process('`h^2^o`')
			expect(file.value).toEqual('<p><code>h^2^o</code></p>')
		})
	})
})

describe('svelte syntax', () => {
	describe('basic html', () => {
		it('should return div tag', async () => {
			const processor = initProcessor()

			const file = await processor.process('<div>hello, markdown</div>')
			expect(file.value).toEqual('<div>hello, markdown</div>')
		})

		it('should return div with attr', async () => {
			const processor = initProcessor()

			const file = await processor.process('<div class="bg-primary">hello, markdown</div>')
			expect(file.value).toEqual('<div class="bg-primary">hello, markdown</div>')
		})

		it('should return div with data', async () => {
			const processor = initProcessor()

			const file = await processor.process('<div class="{class}">hello, {name.toUpperCase()}</div>')
			expect(file.value).toEqual('<div class="{class}">hello, {name.toUpperCase()}</div>')
		})

		it('should return div without contents', async () => {
			const processor = initProcessor()

			const file = await processor.process('<div />')
			expect(file.value).toEqual('<div />')
		})

		it('should return div with multiple line', async () => {
			const processor = initProcessor()

			const file = await processor.process('<div>\nhello, markdown\n\n# hello, remark\n\n</div>')
			expect(file.value).toEqual('<div>\nhello, markdown\n\n# hello, remark\n\n</div>')
		})

		it('should return div with multiple line in attributes', async () => {
			const processor = initProcessor()

			const file = await processor.process('<div\nclass="bg-primary"\n>hello, markdown</div>')
			expect(file.value).toEqual('<div\nclass="bg-primary"\n>hello, markdown</div>')
		})

		it('should return raw', async () => {
			const processor = initProcessor()

			const file = await processor.process('<script lang="ts" module>\nlet count = $state(0);\n</script>')
			expect(file.value).toEqual('<script lang="ts" module>\nlet count = $state(0);\n</script>')
		})

		it('should return html comment', async () => {
			const processor = initProcessor()

			const file = await processor.process('<!-- \nhello, world\n -->')
			expect(file.value).toEqual('<!-- \nhello, world\n -->')
		})

		it('should return instrcutions', async () => {
			const processor = initProcessor()

			const file = await processor.process('<?php \n?\n?\n ?>')
			expect(file.value).toEqual('<?php \n?\n?\n ?>')
		})

		it('should return cdata', async () => {
			const processor = initProcessor()

			const file = await processor.process('<!DOCUMENT test>')
			expect(file.value).toEqual('<!DOCUMENT test>')
		})

		it('should return cdata', async () => {
			const processor = initProcessor()

			const file = await processor.process('<![CDATA[ \n]\n]]\n ]]>')
			expect(file.value).toEqual('<![CDATA[ \n]\n]]\n ]]>')
		})

		it('inline html', async () => {
			const processor = initProcessor()

			const file = await processor.process('# hello <img src={src} />')
			expect(file.value).toEqual('<h1>hello <img src={src} /></h1>')
		})
	})

	describe('basic svelte', () => {
		it('should return image src', async () => {
			const processor = initProcessor()

			const file = await processor.process('<img src={src} alt="{name} dances." />')
			expect(file.value).toEqual('<img src={src} alt="{name} dances." />')
		})

		it('should return image shorthand src', async () => {
			const processor = initProcessor()

			const file = await processor.process('<img {src} alt="{name} dances." />')
			expect(file.value).toEqual('<img {src} alt="{name} dances." />')
		})

		it('should return inline image shorthand src', async () => {
			const processor = initProcessor()

			const file = await processor.process('# title <img {src} alt="{name} dances." />')
			expect(file.value).toEqual('<h1>title <img {src} alt="{name} dances." /></h1>')
		})

		it('should return html tag', async () => {
			const processor = initProcessor()

			const file = await processor.process('{@html variable}')
			expect(file.value).toEqual('{@html variable}')
		})

		it('should return inline html tag', async () => {
			const processor = initProcessor()

			const file = await processor.process('hello {@html variable} markdown')
			expect(file.value).toEqual('<p>hello {@html variable} markdown</p>')
		})

		it('should return inline html tag in two line', async () => {
			const processor = initProcessor()

			const file = await processor.process('hello {@html \nvariable} markdown')
			expect(file.value).toEqual('<p>hello {@html \nvariable} markdown</p>')
		})

		it('should return inline html tag and multiple line', async () => {
			const processor = initProcessor()

			const file = await processor.process('hello {@html \n\nvariable} markdown')
			expect(file.value).toEqual('<p>hello {@html </p>\n<p>variable} markdown</p>')
		})

		it('should return if block', async () => {
			const processor = initProcessor()

			const file = await processor.process('{#if data}')
			expect(file.value).toEqual('{#if data}')
		})

		it('should return if block with multiple line', async () => {
			const processor = initProcessor()

			const file = await processor.process('{#if \n\n\ndata \n\n\n}')
			expect(file.value).toEqual('{#if \n\n\ndata \n\n\n}')
		})

		it('should return paragraph and variable', async () => {
			const processor = initProcessor()

			const file = await processor.process('{variable}')
			expect(file.value).toEqual('<p>{variable}</p>')
		})
	})
})
