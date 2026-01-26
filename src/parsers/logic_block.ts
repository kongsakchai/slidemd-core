import { RootContent, Text } from 'mdast'
import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { codes, types } from 'micromark-util-symbol'
import type {
	Code,
	Construct,
	Effects,
	Extension,
	State,
	Token,
	TokenizeContext,
	TokenType
} from 'micromark-util-types'

export const svelteLogicBlock = (): Extension => {
	const createTokenizerLogic = (inline?: boolean): Construct => ({
		name: 'html',
		tokenize: createTokenizerLogicBlock(inline),
		concrete: true
	})

	return {
		flow: {
			[codes.leftCurlyBrace]: createTokenizerLogic()
		},
		text: {
			[codes.leftCurlyBrace]: createTokenizerLogic(true)
		}
	}

	function createTokenizerLogicBlock(inline?: boolean) {
		return function (this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
			let openScrope = 0
			let openString: Code = 0
			let previousBackslash = false
			let dataToken: Token
			let dataType: TokenType = types.htmlFlowData

			return start

			function start(code: Code): State | undefined {
				if (code !== codes.leftCurlyBrace) return nok(code)

				effects.enter(types.htmlFlow)
				dataToken = effects.enter(dataType)
				effects.consume(code)
				openScrope = 1

				return open
			}

			function open(code: Code) {
				switch (code) {
					case codes.leftCurlyBrace:
						if (!inline) break
						dataType = 'inlineCode'
						dataToken.type = 'inlineCode'
					case codes.numberSign: // #if, #each, #key, #await, #snippet
					case codes.atSign: // @render, @html, @const, @debug
					case codes.colon: // :else, :then, :catch, :final
					case codes.slash: // /if, /each, /await, /key, /snippet
						return more(code)
				}

				return nok(code)
			}

			function more(code: Code) {
				if (code === codes.eof) {
					return nok(code)
				}

				if (!inline && code === codes.lineFeed) {
					effects.enter(types.lineEnding)
					effects.consume(code)
					effects.exit(types.lineEnding)
					effects.exit(dataType)
					effects.enter(dataType)
					return more
				}

				if (!previousBackslash && code === codes.backslash) {
					previousBackslash = true
					effects.consume(code)
					return more
				}

				if (!previousBackslash) {
					switch (code) {
						case codes.quotationMark:
						case codes.graveAccent:
						case codes.apostrophe:
							if (openString === null) {
								openString = code
							}
							break
						case openString:
							openString = null
							break
						case codes.leftCurlyBrace:
							if (openString !== null) openScrope++
							break
						case codes.rightCurlyBrace:
							if (openString !== null) openScrope--
							break
					}
				}

				previousBackslash = false
				effects.consume(code)

				if (openScrope === 0) return done
				return more
			}

			function done(code: Code): State | undefined {
				effects.exit(dataType)
				effects.exit(types.htmlFlow)
				return ok(code)
			}
		}
	}
}

export const inlineCodeFromMarkdown = (): FromMarkdownExtension => {
	return {
		canContainEols: ['inlineCode'],
		enter: { inlineCode: enterToken },
		exit: { inlineCode: exitToken }
	}

	function enterToken(this: CompileContext, token: Token) {
		const node = this.stack[this.stack.length - 1]
		if ('children' in node) {
			const children = node.children as RootContent[]
			const text = { type: 'text', value: '', position: token } as Text
			children.push(text)
		}
	}

	function exitToken(this: CompileContext, token: Token) {
		const node = this.stack[this.stack.length - 1]
		if ('children' in node) {
			const text = node.children[0] as Text
			text.value = this.sliceSerialize(token).slice(1, -1)
		}
	}
}
