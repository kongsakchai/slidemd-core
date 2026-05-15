import 'mdast'
import 'mdast-util-to-hast'

declare module 'micromark-util-types' {
	interface TokenTypeMap {
		highlightSequenceTemp: 'highlightSequenceTemp'
		highlightSequence: 'highlightSequence'
		highlight: 'highlight'
		subscriptSequenceTemp: 'subscriptSequenceTemp'
		subscriptSequence: 'subscriptSequence'
		subscript: 'subscript'
		superscriptSequenceTemp: 'superscriptSequenceTemp'
		superscriptSequence: 'superscriptSequence'
		superscript: 'superscript'
		attribute: 'attribute'
	}
}

declare module 'mdast' {
	interface RootContentMap {
		highlight: {
			type: 'highlight'
			children: import('mdast').PhrasingContent[]
			data: {
				hName: 'mark'
			}
		}
		sub: {
			type: 'sub'
			children: import('mdast').PhrasingContent[]
			data: {
				hName: 'sub'
			}
		}
		sup: {
			type: 'sup'
			children: import('mdast').PhrasingContent[]
			data: {
				hName: 'sup'
			}
		}
		attribute: {
			type: 'attribute'
			value: string
		}
	}
}
