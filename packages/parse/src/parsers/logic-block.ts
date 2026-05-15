import { codes, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, State, TokenType, TokenizeContext } from 'micromark-util-types'

const STRING_DELIMS: Code[] = [codes.quotationMark, codes.graveAccent, codes.apostrophe]

export const svelteLogicBlock = (): Extension => {
	const createTokenizerLogic = (inline?: boolean): Construct => ({
		name: 'html',
		tokenize: createTokenizerLogicBlock(inline),
		concrete: !inline
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
			let depth = 0
			let stringDelim: Code = null
			let hasChunks = false

			const flowType: TokenType = inline ? types.htmlText : types.htmlFlow
			const dataFlowType: TokenType = inline ? types.htmlTextData : types.htmlFlowData

			return start

			function consume(code: Code) {
				if (!hasChunks && code !== codes.lineFeed) effects.enter(dataFlowType)
				hasChunks = code !== codes.lineFeed
				effects.consume(code)
			}

			function start(code: Code): State | undefined {
				effects.enter(flowType)
				consume(code)
				depth = 1

				return open
			}

			function open(code: Code) {
				switch (code) {
					case codes.numberSign: // #if, #each, #key, #await, #snippet
					case codes.colon: // :else, :then, :catch, :final
					case codes.slash: // /if, /each, /await, /key, /snippet
						if (inline) return nok(code)
					// case codes.atSign: // @render, @html, @const, @debug
				}
				return more(code)
			}

			function more(code: Code) {
				if (code === codes.eof) {
					return nok(code)
				}

				if (code === codes.lineFeed) {
					if (hasChunks) effects.exit(dataFlowType)
					effects.enter(types.lineEnding)
					consume(code)
					effects.exit(types.lineEnding)
					return more
				}

				handleString(code)
				handleBrace(code)
				consume(code)
				if (depth === 0) return done()

				return more
			}

			function handleString(code: Code) {
				if (!STRING_DELIMS.includes(code)) return
				stringDelim = stringDelim === code ? null : code
			}

			function handleBrace(code: Code) {
				if (stringDelim !== null) return
				if (code === codes.leftCurlyBrace) depth++
				if (code === codes.rightCurlyBrace) depth--
			}

			function done() {
				effects.exit(dataFlowType)
				effects.exit(flowType)
				return ok
			}
		}
	}
}
