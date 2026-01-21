import { codes, types } from 'micromark-util-symbol'
import type { Code, Effects, Extension, State, TokenizeContext } from 'micromark-util-types'

enum blockType {
	// Type 1: <script> <pre> <style>
	Raw = 1,
	// Type 2: Comment
	Comment,
	// Type 3: Processing instructions <?...?>
	Instruction,
	// Type 4: Declarations <!...>
	Declaration,
	// Type 5: CDATA <![CDATA[...]]>
	CData,
	// Type 6: block tags
	Tags
}

const cdataPrefix = '<![CDATA['
const completeTagExpression = /^<([a-zA-Z][a-zA-Z0-9\-:/.]*)(?:\s[\s\S]*)?\/>/
const openCloseTagExpression = /^<([a-zA-Z][a-zA-Z0-9\-:/.]*)(?:\s[\s\S]*)?>[\s\S]*<\/\1>/

const isAlphabet = (char: number) => {
	return (
		(char >= codes.uppercaseA && char <= codes.uppercaseZ) || (char >= codes.lowercaseA && char <= codes.lowercaseZ)
	)
}

const validateTag = (code: string) => {
	return completeTagExpression.test(code) || openCloseTagExpression.test(code)
}

export const htmlBlock = (): Extension => {
	const tokenizerHTML = {
		name: 'html',
		tokenize: tokenHTML,
		concrete: true
	}

	return {
		disable: {
			null: ['htmlFlow', 'htmlFlowData']
		},
		flow: {
			[codes.lessThan]: tokenizerHTML
			// [codes.leftCurlyBrace]: tokenizer
		}
	}

	function tokenHTML(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
		let buf = ''
		let type = 0
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
				type = blockType.Instruction
				consume(code)
				return more
			}

			// 1 & 6
			if (code !== null && isAlphabet(code)) {
				consume(code)
				return more
			}

			return nok(code)
		}

		function openWithExclamationMark(code: Code) {
			if (code === codes.dash) {
				type = blockType.Comment
				consume(code)
				return openComment
			}
			if (code === codes.leftSquareBracket) {
				type = blockType.CData
				consume(code)
				return openCData
			}
			if (code != null && isAlphabet(code)) {
				type = blockType.Declaration
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
				return beforeClose
			}

			return nok(code)
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
				return beforeClose
			}

			return nok(code)
		}

		function beforeClose(code: Code) {
			if (code === codes.greaterThan) {
				consume(code)
				return done
			}

			return more(code)
		}

		function more(code: Code): State | undefined {
			if (code === codes.eof) {
				return done(code)
			}

			if (code === codes.lineFeed) {
				effects.exit(types.htmlFlowData)
				effects.enter(types.lineEnding)
				consume(code)
				effects.exit(types.lineEnding)
				effects.enter(types.htmlFlowData)
				return more
			}

			if (code === codes.dash && type === blockType.Comment) {
				consume(code)
				return closeComment
			}

			if (code === codes.questionMark && type === blockType.Instruction) {
				consume(code)
				return beforeClose
			}

			if (code === codes.greaterThan && type === blockType.Declaration) {
				consume(code)
				return beforeClose
			}

			if (code === codes.rightSquareBracket && type === blockType.CData) {
				consume(code)
				return closeCData
			}

			if (code === codes.greaterThan) {
				consume(code)
				if (validateTag(buf)) return done
				return more
			}

			consume(code)
			return more
		}

		function done(code: Code): State | undefined {
			if (!validateTag(buf)) return nok(code)

			effects.exit(types.htmlFlowData)
			effects.exit(types.htmlFlow)

			return ok(code)
		}
	}
}
