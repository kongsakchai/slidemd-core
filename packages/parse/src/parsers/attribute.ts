import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { codes } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, State, Token, TokenizeContext } from 'micromark-util-types'

// Attribute extension for micromark; converts token sequences of `@{}` into attribute tokens
export const attribute = (): Extension => {
	const createTokenizerLogic = (): Construct => ({
		name: 'html',
		tokenize: tokenizerAttribute,
		concrete: true
	})

	return {
		text: {
			[codes.atSign]: createTokenizerLogic()
		}
	}

	function tokenizerAttribute(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
		let isClose = false

		return start

		function start(code: Code) {
			effects.enter('attribute')
			effects.consume(code)
			return open
		}

		function open(code: Code) {
			if (code === codes.leftCurlyBrace) {
				effects.consume(code)
				return more
			}

			return nok(code)
		}

		function more(code: Code) {
			if (isClose) {
				if (code === codes.eof || code === codes.lineFeed) return ok(code)
				return nok(code)
			}

			if (code === codes.eof || code === codes.lineFeed) {
				return nok(code)
			}

			if (code === codes.rightCurlyBrace) {
				effects.consume(code)
				effects.exit('attribute')
				isClose = true
				return more
			}

			effects.consume(code)
			return more
		}
	}
}

// FromMarkdown extension to convert attribute tokens into MDAST nodes
export const attributeFromMarkdown = (): FromMarkdownExtension => {
	return {
		canContainEols: ['attribute'],
		enter: { attribute: enterToken },
		exit: { attribute: exitToken }
	}

	function enterToken(this: CompileContext, token: Token) {
		this.enter(
			{
				type: 'attribute',
				value: this.sliceSerialize(token).slice(2, -1)
			},
			token
		)
	}

	function exitToken(this: CompileContext, token: Token) {
		this.exit(token)
	}
}
