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

// Type 1: <script>, <pre>, <style>, <textarea>
const rawTagNames = ['pre', 'script', 'style', 'textarea']
const rawTagExpression = /^<(pre|script|style|textarea)(?:\s[\s\S]*)?>[\s\S]*<\/\1>$/i

// Type 2: HTML comments <!--...-->
const commentExpression = /^<!--[\s\S]*-->$/

// Type 3: Processing instructions <?...?>
const instructionExpression = /^<\?[\s\S]*\?>/

// Type 4: Declarations <!...>
const declarationExpression = /^<![A-Z][\s\S]*>$/

// Type 5: CDATA <![CDATA[...]]>
const cdataPrefix = '<![CDATA['
const cdataExpression = /^<!\[CDATA\[[\s\S]*\]\]>$/

// Type 6: Standard block tags
const tagNameExpression = /^<([a-zA-Z][a-zA-Z0-9\-:/.]*)/
const completeTagExpression = /^<([a-zA-Z][a-zA-Z0-9\-:/.]*)(?:\s[\s\S]*)?\/>$/
const openCloseTagExpression = /^<([a-zA-Z][a-zA-Z0-9\-:/.]*)(?:\s[\s\S]*)?>[\s\S]*<\/\1>$/

const isAlphabet = (char: number) => {
	return (
		(char >= codes.uppercaseA && char <= codes.uppercaseZ) || (char >= codes.lowercaseA && char <= codes.lowercaseZ)
	)
}

export const htmlBlock = (): Extension => {
	const createTokenizerHTML = (inline?: boolean) => ({
		name: 'html',
		tokenize: createTokenizerHTMLBlock(inline),
		concrete: true
	})

	return {
		disable: {
			null: ['htmlFlow', 'htmlFlowData']
		},
		flow: {
			[codes.lessThan]: createTokenizerHTML()
		},
		text: {
			[codes.lessThan]: createTokenizerHTML(true)
		}
	}

	function createTokenizerHTMLBlock(inline?: boolean) {
		return function (this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
			let buf = ''
			let type = 0
			let previousSlash = false
			return start

			function consume(code: Code) {
				effects.consume(code)
				if (code !== codes.eof) buf += code < 0 ? ' ' : String.fromCharCode(code)
			}

			function start(code: Code): State | undefined {
				if (code !== codes.lessThan) return nok(code)

				effects.enter(types.htmlFlow)
				effects.enter(types.htmlFlowData)
				consume(code)

				return open
			}

			function open(code: Code): State | undefined {
				// 2, 4 & 5
				if (code === codes.exclamationMark) {
					consume(code)
					return openWithExclamationMark
				}

				// 3
				if (code === codes.questionMark) {
					type = BlockType.Instruction
					consume(code)
					return more
				}

				// 1 & 6 & 7
				if (code !== null && isAlphabet(code)) {
					consume(code)
					return more
				}

				return nok(code)
			}

			function openWithExclamationMark(code: Code) {
				if (code === codes.dash) {
					type = BlockType.Comment
					consume(code)
					return openComment
				}
				if (code === codes.leftSquareBracket) {
					type = BlockType.CData
					consume(code)
					return openCData
				}
				if (code != null && isAlphabet(code)) {
					type = BlockType.Declaration
					consume(code)
					return more
				}

				return nok(code)
			}

			function openComment(code: Code) {
				if (code === codes.dash) {
					consume(code)
					return more
				}

				return nok(code)
			}

			function closeComment(code: Code) {
				if (code === codes.dash) {
					consume(code)
					return closeTag
				}

				return more(code)
			}

			function openCData(code: Code) {
				if (code === codes.eof) return nok(code)

				if (buf.length < cdataPrefix.length) {
					consume(code)
					if (buf === cdataPrefix) {
						return more
					}

					return openCData
				}
				return nok(code)
			}

			function closeCData(code: Code) {
				if (code === codes.rightSquareBracket) {
					consume(code)
					return closeTag
				}

				return more(code)
			}

			function closeTag(code: Code) {
				if (code === codes.greaterThan) {
					consume(code)
					if (shouldEnd()) return done
					return more
				}
				return more(code)
			}

			function tagName(code: Code) {
				const regex = buf.match(tagNameExpression)
				if (!regex || regex?.length < 2) nok(code)

				if (previousSlash) {
					type = BlockType.Complete
					return more(code)
				}

				if (rawTagNames.includes(regex?.[1] || '')) {
					type = BlockType.Raw
					return more(code)
				}

				type = BlockType.Tags
				return more(code)
			}

			function more(code: Code): State | undefined {
				if (code === codes.eof) {
					return nok(code)
				}

				if (code === codes.slash) {
					previousSlash = true
					consume(code)
					return more
				}

				if (!inline && code === codes.lineFeed) {
					effects.enter(types.lineEnding)
					consume(code)
					effects.exit(types.lineEnding)
					effects.exit(types.htmlFlowData)
					effects.enter(types.htmlFlowData)
					return more
				}

				if (code === codes.dash && type === BlockType.Comment) {
					consume(code)
					return closeComment
				}

				if (code === codes.questionMark && type === BlockType.Instruction) {
					consume(code)
					return closeTag
				}

				if (code === codes.greaterThan && type === BlockType.Declaration) {
					return closeTag(code)
				}

				if (code === codes.rightSquareBracket && type === BlockType.CData) {
					consume(code)
					return closeCData
				}

				if (code === codes.greaterThan) {
					if (type === BlockType.Unknow) {
						return tagName(code)
					}
					return closeTag(code)
				}

				previousSlash = false
				consume(code)
				return more
			}

			function shouldEnd(): boolean {
				switch (type) {
					case BlockType.Raw:
						return rawTagExpression.test(buf)
					case BlockType.Comment:
						return commentExpression.test(buf)
					case BlockType.Instruction:
						return instructionExpression.test(buf)
					case BlockType.Declaration:
						return declarationExpression.test(buf)
					case BlockType.CData:
						return cdataExpression.test(buf)
					case BlockType.Tags:
						return openCloseTagExpression.test(buf)
					case BlockType.Complete:
						return completeTagExpression.test(buf)
				}

				return false
			}

			function done(code: Code): State | undefined {
				effects.exit(types.htmlFlowData)
				effects.exit(types.htmlFlow)

				return ok(code)
			}
		}
	}
}
