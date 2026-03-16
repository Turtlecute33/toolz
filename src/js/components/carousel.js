export function carousel() {
	var t = this
	t.slides = document.querySelectorAll('.slide')
	t.next = document.querySelector('.next-btn')
	t.prev = document.querySelector('.prev-btn')
	t.dots = document.querySelectorAll('.dot')
	t.index = 1
	if (t.next) {
		t.next.addEventListener('click', () => {
			t.showSlides((t.index += 1))
		})
	}
	if (t.prev) {
		t.prev.addEventListener('click', () => {
			t.showSlides((t.index += -1))
		})
	}
	t.dots.forEach((element, i) => {
		element.addEventListener('click', () => {
			t.showSlides((t.index = i + 1))
		})
	})
	t.showSlides = (n) => {
		var i
		if (n > t.slides.length) t.index = 1
		if (n < 1) t.index = t.slides.length
		for (i = 0; i < t.slides.length; i++) {
			t.slides[i].style.display = 'none'
		}
		for (i = 0; i < t.dots.length; i++) {
			t.dots[i].className = t.dots[i].className.replace(' active', '')
		}
		t.slides[t.index - 1].style.display = 'block'
		t.dots[t.index - 1].className += ' active'
	}
	t.showSlides(t.index)
}
