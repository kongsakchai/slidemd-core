export function copyCode(e: Event) {
	const button = e.currentTarget as HTMLButtonElement
	const pre = button.parentNode?.querySelector('pre')
	if (!pre) return

	navigator.clipboard.writeText(pre.innerText)
	button.classList.add('copied')
	setTimeout(() => {
		button.classList.remove('copied')
	}, 1000)
}
