export type AttributeValue = string | number | boolean | null | undefined | (string | number | boolean)[]

export type Attribute = {
	[key: string]: AttributeValue | Attribute
}

export type Directive = Record<string, AttributeValue | Attribute | Attribute[]>
