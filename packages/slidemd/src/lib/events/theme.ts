export function loadTheme() {
	const themeMode = localStorage.getItem('slidemd.mode') || 'light'
	if (themeMode === 'dark') {
		document.documentElement.classList.add('dark')
	} else {
		document.documentElement.classList.remove('dark')
	}
}
