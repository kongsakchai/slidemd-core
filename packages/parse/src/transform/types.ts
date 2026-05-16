export type AttributeValue = string | number | boolean | null | undefined | (string | number | boolean)[]

export type Attribute = {
	step: number
	[key: string]: AttributeValue
}

export type Directive = Record<string, Attribute | AttributeValue | Directive[]>
