export function fontChecker() {
	var baseFonts = ['monospace', 'sans-serif', 'serif']
	var testString = 'abcdefghilmnopqrstuvz'
	var testSize = '72px'
	var h = document.getElementsByTagName('body')[0]
	var s = document.createElement('span')
	s.style.fontSize = testSize
	s.innerHTML = testString
	var defaultWidth = {}
	var defaultHeight = {}
	for (var i = 0; i < baseFonts.length; i++) {
		s.style.fontFamily = baseFonts[i]
		h.appendChild(s)
		defaultWidth[baseFonts[i]] = s.offsetWidth
		defaultHeight[baseFonts[i]] = s.offsetHeight
		h.removeChild(s)
	}

	this.detect = function (font) {
		var detected = false
		for (var i = 0; i < baseFonts.length; i++) {
			s.style.fontFamily = font + ',' + baseFonts[i]
			h.appendChild(s)
			var matched =
				s.offsetWidth != defaultWidth[baseFonts[i]] ||
				s.offsetHeight != defaultHeight[baseFonts[i]]
			h.removeChild(s)
			detected = detected || matched
		}
		return detected
	}
}
