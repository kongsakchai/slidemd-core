import { codes, types } from 'micromark-util-symbol'
import type { Code, Construct, Effects, Extension, State, TokenType, TokenizeContext } from 'micromark-util-types'

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

function isURL(url: string) {
	try {
		new URL(url)
		return true
	} catch {
		return false
	}
}

export const htmlBlock = (): Extension => {
	const createTokenizerHTML = (inline?: boolean): Construct => ({
		name: 'html',
		tokenize: createTokenizerHTMLBlock(inline),
		concrete: !inline
	})

	return {
		flow: {
			[codes.lessThan]: createTokenizerHTML() // trigger tokenizer when `<` is found at the start of a line (flow context)
		},
		text: {
			[codes.lessThan]: createTokenizerHTML(true) // trigger tokenizer when `<` is found in inline text (text context)
		}
	}

	function createTokenizerHTMLBlock(inline?: boolean, isSub = false) {
		return function (this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
			let buf = ''
			let type = 0
			let escape = false

			const flowType: TokenType = inline ? types.htmlText : types.htmlFlow
			const dataFlowType: TokenType = inline ? types.htmlTextData : types.htmlFlowData

			const events = this.events

			return start

			function start(code: Code): State | undefined {
				if (!isSub) effects.enter(flowType)
				consume(code)

				return open
			}

			function consume(code: Code) {
				if (!hasChunks() && code !== codes.lineFeed) effects.enter(dataFlowType)
				buf += !code || code < 0 ? ' ' : String.fromCharCode(code)
				effects.consume(code)
			}

			// check last event is end
			function hasChunks() {
				return (
					events.length > 0 &&
					events[events.length - 1][0] === 'enter' &&
					events[events.length - 1][1].type === dataFlowType
				)
			}

			// check the first character after `<` to determine the block type
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

			// For blocks starting with `<!`, determine if it's a comment, CDATA, declaration, or something else based on the next characters
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

			// For comment blocks, look for the closing `<!--` sequence
			function openComment(code: Code) {
				if (code === codes.dash) {
					consume(code)
					return more
				}

				return nok(code)
			}

			// For comment blocks, look for the closing `-->` sequence
			function closeComment(code: Code) {
				if (code === codes.dash) {
					consume(code)
					return closeTag
				}

				return more(code)
			}

			// For CDATA blocks, look for the closing `<![CDATA[` sequence
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

			// For CDATA blocks, look for the closing `]]>` sequence
			function closeCData(code: Code) {
				if (code === codes.rightSquareBracket) {
					consume(code)
					return closeTag
				}

				return more(code)
			}

			// For tag blocks, look for the closing `>` and determine if the block is complete or not based on the tag name and content
			function closeTag(code: Code) {
				if (code === codes.greaterThan) {
					consume(code)
					if (shouldEnd(type, buf)) {
						return done
					}
					return more
				}
				return more(code)
			}

			// For tag blocks, after reading the tag name, look for the closing `>` and determine if the block is complete or not based on the tag name and content
			function tagName(code: Code) {
				if (isURL(buf.slice(1))) {
					return nok(code)
				}

				if (escape) {
					type = BlockType.Complete
					return more(code)
				}

				const regex = buf.match(tagNameExpression)
				if (regex && rawTagNames.includes(regex[1])) {
					type = BlockType.Raw
					return more(code)
				}

				type = BlockType.Tags
				return more(code)
			}

			// When a `<` is found inside a block, attempt to parse it as a nested HTML block. If it fails, treat it as part of the current block content and continue parsing
			function subTag(code: Code) {
				return effects.attempt(
					{ tokenize: createTokenizerHTMLBlock(inline, true), partial: true },
					more,
					skipSubTag
				)(code)
			}

			// If the nested block parsing fails, treat the `<` as part of the current block content and continue parsing
			function skipSubTag(code: Code) {
				consume(code)
				return more
			}

			// For all block types, keep consuming characters until the appropriate closing sequence is found, while also handling line breaks for non-inline blocks
			function more(code: Code): State | undefined {
				if (code === codes.eof) {
					return nok(code)
				}

				if (code === codes.slash) {
					escape = true
					consume(code)
					return more
				}

				// For non-inline blocks, allow line breaks and treat them as part of the block content
				if (code === codes.lineFeed) {
					if (hasChunks()) effects.exit(dataFlowType)
					effects.enter(types.lineEnding)
					consume(code)
					effects.exit(types.lineEnding)
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

				if (code === codes.lessThan) {
					return subTag(code)
				}

				escape = false
				consume(code)
				return more
			}

			function done(code: Code): State | undefined {
				effects.exit(dataFlowType)
				if (!isSub) effects.exit(flowType)
				return ok(code)
			}
		}
	}
}

function shouldEnd(type: BlockType, buf: string): boolean {
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
		default: // complete tag
			return completeTagExpression.test(buf)
	}
}
