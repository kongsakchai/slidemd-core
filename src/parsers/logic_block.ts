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

let openStringScropeCodes: Code[] = [codes.quotationMark, codes.graveAccent, codes.apostrophe]

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
			let scrope = 0
			let stringScrope: Code = null
			let previousBackslash = false

			let enteredToken: Token
			let dataFlowType: TokenType = types.htmlFlowData

			return start

			function start(code: Code): State | undefined {
				if (code !== codes.leftCurlyBrace) return nok(code)

				effects.enter(types.htmlFlow)
				enteredToken = effects.enter(dataFlowType)
				effects.consume(code)
				scrope = 1

				return open
			}

			function open(code: Code) {
				switch (code) {
					case codes.leftCurlyBrace:
						if (!inline) break
						dataFlowType = 'inlineCode'
						enteredToken.type = 'inlineCode'
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
					effects.exit(dataFlowType)
					effects.enter(dataFlowType)
					return more
				}

				if (!previousBackslash) {
					if (code === codes.backslash) {
						previousBackslash = true
						effects.consume(code)
						return more
					}

					if (openStringScropeCodes.includes(code)) {
						openString(code)
					}

					switch (code) {
						case codes.leftCurlyBrace:
							if (stringScrope === null) scrope++
							break
						case codes.rightCurlyBrace:
							if (stringScrope === null) scrope--
							break
					}
				}

				previousBackslash = false
				effects.consume(code)

				if (scrope === 0) {
					effects.exit(dataFlowType)
					effects.exit(types.htmlFlow)
					return ok
				}

				return more
			}

			function openString(code: Code) {
				if (stringScrope === null) {
					stringScrope = code
				} else if (stringScrope !== null && stringScrope === code) {
					stringScrope = null
				}
			}
		}
	}
}

export const inlineCodeFromMarkdown = (): FromMarkdownExtension => {
	return {
		canContainEols: ['inlineCode'],
		enter: { inlineCode: enterToken }
	}

	function enterToken(this: CompileContext, token: Token) {
		const node = this.stack[this.stack.length - 1]
		if ('children' in node) {
			const children = node.children as RootContent[]
			const text = { type: 'text', value: '', position: token } as Text
			text.value = this.sliceSerialize(token).slice(1, -1)
			children.push(text)
		}
	}
}
