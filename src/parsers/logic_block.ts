import { codes, types } from 'micromark-util-symbol'
import type { Code, Effects, Extension, State, TokenizeContext } from 'micromark-util-types'

enum BlockType {
	Unknow = 0,
	// Type 1: <script> <pre> <style>
	Raw,
	// Type 2: Comment
	Comment,
	// Type 3: Processing instructions <?...?>
	Instruction,
	// Type 4: Declarations <!...>
	Declaration,
	// Type 5: CDATA <![CDATA[...]]>
	CData,
	// Type 6: block tags
	Tags,
	// Type 7: complete tags <.../>
	Complete
}

export const logicBlock = (): Extension => {
	const createTokenizerLogic = (inline?: boolean) => ({
		name: 'html',
		tokenize: createTokenizerLogicBlock(inline),
		concrete: true
	})

	return {
		disable: {
			null: ['htmlFlow', 'htmlFlowData']
		},
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

			return start

			function start(code: Code): State | undefined {
				if (code !== codes.leftCurlyBrace) return nok(code)

				effects.enter(types.htmlFlow)
				effects.enter(types.htmlFlowData)
				effects.consume(code)
				openScrope = 1

				return open
			}

			function open(code: Code) {
				switch (code) {
					case codes.numberSign:
					case codes.atSign:
					case codes.colon:
					case codes.slash:
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
					effects.exit(types.htmlFlowData)
					effects.enter(types.htmlFlowData)
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
				effects.exit(types.htmlFlowData)
				effects.exit(types.htmlFlow)

				return ok(code)
			}
		}
	}
}
