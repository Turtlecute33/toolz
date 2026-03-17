export function aos() {
	let items = document.querySelectorAll('[class*=_aos]')
	if (typeof IntersectionObserver !== 'undefined' && items.length > 0) {
		let callback = function (entries) {
			entries.forEach((entry) => {
				if (
					entry.isIntersecting &&
					!entry.target.classList.contains('_aos-done')
				) {
					entry.target.classList.add('_aos-done')
				}
			})
		}
		let observer = new IntersectionObserver(callback, {
			root: null,
			threshold: 0
		})
		items.forEach((item) => {
			observer.observe(item)
		})
	}
}
