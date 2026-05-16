import { Node } from 'unist'
import { BuildVisitor, type Test, visit } from 'unist-util-visit'

import { Attribute } from './types'

// attribute extractor, used for parsing attributes in string
// it's start of string or whitespace
// followed by key, which can be word characters, hyphen, colon or at sign and must start with a letter
// optionally followed by = and value, which can be in double quotes, single quotes or unquoted
// it's end of string or whitespace
const ATTR_REGEX = /(?<=^|\s)([a-zA-Z][\w-@:]+)(?:="([\s\S]*?)"|='([\s\S]*?)'|=([^\s]+?))?(?=\s|$)/g

export const extractAttributes = (str?: string | null): Attribute => {
	if (!str) return {}
	const attrs: Attribute = {}
	for (const match of str.matchAll(ATTR_REGEX)) {
		const key = match[1]
		const value = match[2] || match[3] || match[4] || true
		attrs[key] = value
	}
	return attrs
}

// class extractor, used for parsing class names in string
// it's start of string or whitespace
// followed by a dot and class name, which can be any characters except whitespace
// it's end of string or whitespace
const CLASS_REGEX = /(?<=^|\s)\.([^\s]+)(?=\s|$)/g

export const extractClassNames = (str?: string | null) => {
	if (!str) return []
	return Array.from(str.matchAll(CLASS_REGEX), (m) => m[1])
}

// id extractor, used for parsing id name in string
// it's start of string of whitespace
// followed by a numberSign and id name, which can be any characters except whitespace
// it's end of string or whitespace
const ID_REGEX = /(?<=^|\s)#([^\s]+)(?=\s|$)/g

export const extractIDs = (str?: string | null) => {
	if (!str) return []
	return Array.from(str.matchAll(ID_REGEX), (m) => m[1])
}

// step extractor, used for parsing step key in string
// it's start of string of whitespace
// followed by key, which can be number characters, and must start with a `step-`
// it's end of string, equals or whitespace
const STEP_REGEX = /(?<=^|\s)step-(\d+)(?==|\s|$)/g

export const extractMaxStep = (str?: string | null) => {
	if (!str) return 0
	let step = 0
	for (const match of str.matchAll(STEP_REGEX)) {
		step = Math.max(parseInt(match[1]), step)
	}
	return step
}

export const mapNode = <Tree extends Node, Check extends Test, T>(
	tree: Tree,
	test: Check,
	visitor: (...args: Parameters<BuildVisitor<Tree, Check>>) => T
) => {
	const results: T[] = []
	visit(tree, test, (node, index, parent) => {
		results.push(visitor(node, index, parent))
	})
	return results
}

export const fallbackParseInt = (str: string, fallback: number) => {
	const resp = parseInt(str)
	return isNaN(resp) ? fallback : resp
}

export const getStepMax = (cur: number, step: string) => {
	if (step.startsWith('step-')) {
		return Math.max(fallbackParseInt(step.slice(5), cur), cur)
	}
	return cur
}

export const getAttributes = (str?: string | null) => {
	const attrs = extractAttributes(str)

	const ids = extractIDs(str)
	if (typeof attrs.id === 'string') ids.push(attrs.id)
	attrs.id = ids.filter(Boolean).join(' ')
	if (!attrs.id) delete attrs.id

	const className = extractClassNames(str)
	if (typeof attrs.class === 'string') className.push(attrs.class)
	attrs.class = className.filter(Boolean).join(' ')
	if (!attrs.class) delete attrs.class

	attrs.step = extractMaxStep(str)
	if (!attrs.step) delete attrs.step

	return attrs
}

export function asString(v: unknown, defaultVal: string): string
export function asString(v: unknown, defaultVal?: undefined): string | undefined
export function asString(v: unknown, defaultVal?: string): string | undefined {
	return typeof v === 'string' ? v : defaultVal
}

export function asNumber(v: unknown, defaultVal: number): number
export function asNumber(v: unknown, defaultVal?: undefined): number | undefined
export function asNumber(v: unknown, defaultVal?: number): number | undefined {
	return typeof v === 'number' ? v : defaultVal
}

export const maxValue = (a: unknown, b: unknown) => {
	if (!a && !b) return undefined
	if (!a) return asNumber(b)
	if (!b) return asNumber(a)

	return Math.max(asNumber(a, 0), asNumber(b, 0))
}
