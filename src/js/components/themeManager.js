export function themeManager() {
	//Theme Switcher
	var toggles = document.getElementsByClassName('theme-toggle')

	if (window.CSS && CSS.supports('color', 'var(--bg)') && toggles) {
		var storedTheme
		try {
			storedTheme = localStorage.getItem('theme')
		} catch (e) {
			storedTheme = null
		}
		if (!storedTheme) {
			storedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'
		}
		if (storedTheme)
			document.documentElement.setAttribute('data-theme', storedTheme)
		// Set initial aria-checked state on toggle switches
		var isDark = storedTheme === 'dark'
		for (var i = 0; i < toggles.length; i++) {
			toggles[i].setAttribute('aria-checked', isDark ? 'true' : 'false')
			toggles[i].onclick = function () {
				var currentTheme =
					document.documentElement.getAttribute('data-theme')
				var targetTheme = 'light'

				if (currentTheme === 'light') {
					targetTheme = 'dark'
				}

				document.documentElement.setAttribute('data-theme', targetTheme)
				// Update aria-checked on all toggle switches
				for (var j = 0; j < toggles.length; j++) {
					toggles[j].setAttribute('aria-checked', targetTheme === 'dark' ? 'true' : 'false')
				}
				try {
					localStorage.setItem('theme', targetTheme)
				} catch (e) { /* localStorage unavailable */ }
			}
		}
	}
}
