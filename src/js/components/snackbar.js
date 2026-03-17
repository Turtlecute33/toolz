export function Snackbar(option) {
	const t = this
	t.snack = document.createElement('div')
	t.snack.className = 'snackbar'
	t.message = document.createElement('div')
	t.snack.appendChild(t.message)
	document.body.appendChild(t.snack)

	t.top = option.topPos
	t.classNames = option.classNames
	t.autoClose =
		typeof option.autoClose === 'boolean' ? option.autoClose : false
	t.autoCloseTimeout =
		option.autoClose && typeof option.autoCloseTimeout === 'number'
			? option.autoCloseTimeout
			: 3000

	//Methods
	t.currentType = null
	t.reset = function () {
		t.message.textContent = ''
		if (t.currentType) t.snack.classList.remove(t.currentType)
		t.currentType = null
	}
	t._autoCloseTimer = null
	t.show = function (msg, type) {
		t.hide()
		t.message.textContent = msg
		t.snack.style.top = t.top
		t.currentType = type || t.classNames
		t.snack.classList.add(t.currentType)

		if (t.autoClose) {
			if (t._autoCloseTimer) clearTimeout(t._autoCloseTimer)
			t._autoCloseTimer = setTimeout(function () {
				t.hide()
				t._autoCloseTimer = null
			}, t.autoCloseTimeout)
		}
	}
	t.hide = function () {
		t.snack.style.top = '-100%'
		t.reset()
	}
}
