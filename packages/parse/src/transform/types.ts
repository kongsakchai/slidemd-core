export type AttributeValue = string | number | boolean | (string | number)[] | null | undefined

export type Attribute = Record<string, AttributeValue>

export type Directive = Record<string, Attribute | AttributeValue>
