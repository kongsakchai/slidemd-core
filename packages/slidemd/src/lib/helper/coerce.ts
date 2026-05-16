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
