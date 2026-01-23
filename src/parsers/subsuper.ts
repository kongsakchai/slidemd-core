import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import { resolveAll } from 'micromark-util-resolve-all'
import { codes, types } from 'micromark-util-symbol'
import type { Code, Effects, Event, Extension, State, Token, TokenizeContext } from 'micromark-util-types'

export const subscript = (): Extension => {
	const tokenizer = {
		name: 'subscript',
		tokenize: tokenizerSubscript,
		resolveAll: resolveAllSubscript
	}

	return {
		text: { [codes.tilde]: tokenizer },
		insideSpan: { null: [tokenizer] },
		attentionMarkers: { null: [codes.tilde] }
	}

	function tokenizerSubscript(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
		const previous = this.previous
		const events = this.events
		let size = 0
		return start

		function start(code: Code) {
			if (code != codes.tilde) return nok(code)

			if (previous === codes.tilde && events[events.length - 1][1].type !== types.characterEscape) {
				return nok(code)
			}

			effects.enter('subscriptSequenceTemp')
			return more(code)
		}

		function more(code: Code) {
			if (code === codes.tilde) {
				if (size >= 1) return nok(code)

				effects.consume(code)
				size++
				return more
			}
			if (size < 1) return nok(code)

			effects.exit('subscriptSequenceTemp')
			return ok(code)
		}
	}

	function resolveAllSubscript(events: Event[], context: TokenizeContext) {
		for (let open = 0; open < events.length; open++) {
			// find open
			if (events[open][0] === 'exit' && events[open][1].type === 'subscriptSequenceTemp') {
				// walk next
				for (let close = open + 1; close < events.length; close++) {
					// find close
					if (events[close][0] === 'enter' && events[close][1].type === 'subscriptSequenceTemp') {
						events[open][1].type = 'subscriptSequence'
						events[close][1].type = 'subscriptSequence'

						const highlightToken: Token = {
							type: 'subscript',
							start: Object.assign({}, events[open][1].start),
							end: Object.assign({}, events[close][1].end)
						}

						const insideSpan = context.parser.constructs.insideSpan.null
						const resolveInside = insideSpan
							? resolveAll(insideSpan, events.slice(open + 1, close), context)
							: []

						const nextEvents: Array<Event> = [
							['enter', highlightToken, context],
							['enter', events[open][1], context],
							['exit', events[open][1], context],
							// ['enter', text, context],
							...resolveInside,
							// ['exit', text, context],
							['enter', events[close][1], context],
							['exit', events[close][1], context],
							['exit', highlightToken, context]
						]

						events.splice(open - 1, close - open + 3, ...nextEvents)

						open += nextEvents.length - 2
						break
					}
				}
			}
		}

		// reset type
		for (let index = 0; index < events.length; index++) {
			if (events[index][1].type === 'subscriptSequenceTemp') {
				events[index][1].type = 'data'
			}
		}

		return events
	}
}

export const subscriptFromMarkdown = (): FromMarkdownExtension => {
	return {
		canContainEols: ['subscript'],
		enter: { subscript: enterToken },
		exit: { subscript: exitToken }
	}

	function enterToken(this: CompileContext, token: Token) {
		this.enter(
			{
				type: 'sub',
				children: [],
				data: {
					hName: 'sub'
				}
			},
			token
		)
	}

	function exitToken(this: CompileContext, token: Token) {
		this.exit(token)
	}
}

export const superscript = (): Extension => {
	const tokenizer = {
		name: 'superscript',
		tokenize: tokenizerSuperscript,
		resolveAll: resolveAllSuperscript
	}

	return {
		text: { [codes.caret]: tokenizer },
		insideSpan: { null: [tokenizer] },
		attentionMarkers: { null: [codes.caret] }
	}

	function tokenizerSuperscript(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
		const previous = this.previous
		const events = this.events
		let size = 0
		return start

		function start(code: Code) {
			if (code != codes.caret) return nok(code)

			if (previous === codes.tilde && events[events.length - 1][1].type !== types.characterEscape) {
				return nok(code)
			}

			effects.enter('superscriptSequenceTemp')
			return more(code)
		}

		function more(code: Code) {
			if (code === codes.caret) {
				if (size >= 1) return nok(code)

				effects.consume(code)
				size++
				return more
			}
			if (size < 1) return nok(code)

			effects.exit('superscriptSequenceTemp')
			return ok(code)
		}
	}

	function resolveAllSuperscript(events: Event[], context: TokenizeContext) {
		for (let open = 0; open < events.length; open++) {
			// find open
			if (events[open][0] === 'exit' && events[open][1].type === 'superscriptSequenceTemp') {
				// walk next
				for (let close = open + 1; close < events.length; close++) {
					// find close
					if (events[close][0] === 'enter' && events[close][1].type === 'superscriptSequenceTemp') {
						events[open][1].type = 'superscriptSequence'
						events[close][1].type = 'superscriptSequence'

						const highlightToken: Token = {
							type: 'superscript',
							start: Object.assign({}, events[open][1].start),
							end: Object.assign({}, events[close][1].end)
						}

						const insideSpan = context.parser.constructs.insideSpan.null
						const resolveInside = insideSpan
							? resolveAll(insideSpan, events.slice(open + 1, close), context)
							: []

						const nextEvents: Array<Event> = [
							['enter', highlightToken, context],
							['enter', events[open][1], context],
							['exit', events[open][1], context],
							// ['enter', text, context],
							...resolveInside,
							// ['exit', text, context],
							['enter', events[close][1], context],
							['exit', events[close][1], context],
							['exit', highlightToken, context]
						]

						events.splice(open - 1, close - open + 3, ...nextEvents)

						open += nextEvents.length - 2
						break
					}
				}
			}
		}

		// reset type
		for (let index = 0; index < events.length; index++) {
			if (events[index][1].type === 'superscriptSequenceTemp') {
				events[index][1].type = 'data'
			}
		}

		return events
	}
}

export const superscriptFromMarkdown = (): FromMarkdownExtension => {
	return {
		canContainEols: ['superscript'],
		enter: { superscript: enterToken },
		exit: { superscript: exitToken }
	}

	function enterToken(this: CompileContext, token: Token) {
		this.enter(
			{
				type: 'sup',
				children: [],
				data: {
					hName: 'sup'
				}
			},
			token
		)
	}

	function exitToken(this: CompileContext, token: Token) {
		this.exit(token)
	}
}
