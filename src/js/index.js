import '../sass/index.sass'
import * as data from '../data/adblock_data.json'
import packageJSON from '../../package.json'
import { icons } from '../data/icons'
import { navbar } from './components/navbar'
import A11yDialog from './components/dialog'
import { themeManager } from './components/themeManager'
import { gotop } from './components/gotop'
import { aos } from './components/aos'
import { fadeIn, fadeOut } from './components/fade'
import { Snackbar } from './components/snackbar'
import { LocalStorageManager } from './components/localStorage'
const cd = document.querySelector('#dlg_changelog')
const ch_dialog = new A11yDialog(cd)
const TZ = new LocalStorageManager('toolz')
const version = packageJSON.version
const tzversion = TZ.get('version')
if (tzversion !== version) {
	ch_dialog.show()
	TZ.set('version', version)
}
const LS = new LocalStorageManager('adb_tool')
let results = LS.get('results')
let settings = LS.get('settings')
if (!settings || settings['showCF'] == undefined) {
	settings = {
		collapseAll: true,
		showCF: true,
		showSL: true
	}
	LS.set('settings', settings)
}

let tslog = ''
function resetTestState() {
	tslog = ''
	abt.total = 0
	abt.blocked = 0
	abt.notblocked = 0
	abt.cosmetic_test.static = null
	abt.cosmetic_test.dynamic = null
	abt.script.ads = null
	abt.script.pagead = null
	abt.hosts = {}
}
if (!results) results = []
const test_log = document.getElementById('test_log')
const snackbar = new Snackbar({
	topPos: '10px',
	classNames: 'success',
	autoClose: true,
	autoCloseTimeout: 2000
})
function downloadResult(k) {
	const r = results.find((ri) => ri['time'] == k)
	if (!r) return
	const jsonData = JSON.stringify(r)
	const blob = new Blob([jsonData], { type: 'application/json' })
	const url = URL.createObjectURL(blob)
	const linkElement = document.createElement('a')
	linkElement.href = url
	linkElement.setAttribute('download', 'toolz_adb_' + r.date + '.json')
	linkElement.click()
	setTimeout(() => URL.revokeObjectURL(url), 1000)
}
async function copyToClip(str) {
	try {
		await navigator.clipboard.writeText(str)
		snackbar.show('URL copied to clipboard !')
	} catch (err) {
		const txt = document.createElement('textarea')
		txt.value = str
		txt.setAttribute('readonly', '')
		txt.style.position = 'absolute'
		txt.style.left = '-9999px'
		document.body.appendChild(txt)

		txt.select()
		txt.setSelectionRange(0, 99999)
		document.execCommand('copy')
		txt.remove()
		snackbar.show('URL copied to clipboard !')
	}
}
let abt = {
	total: 0,
	blocked: 0,
	notblocked: 0,
	cosmetic_test: {
		static: null,
		dynamic: null
	},
	script: {
		ads: null,
		pagead: null
	},
	hosts: {}
}
const testWrapper = document.getElementById('test')

// Pre-calculate total test count from data to avoid race conditions (#5)
function countTotalTests() {
	let count = 0
	Object.keys(data).forEach((key) => {
		if (key == 'default') return
		const category = data[key]
		Object.keys(category).forEach((keyC) => {
			if (Object.prototype.hasOwnProperty.call(category, keyC)) {
				count += category[keyC].length
			}
		})
	})
	return count
}

//Function to check a host blocking status
async function check_url(url, div, parent, k1, k2) {
	const controller = new AbortController()
	const config = {
		method: 'HEAD',
		mode: 'no-cors',
		signal: controller.signal
	}
	const abortTimeout = setTimeout(() => {
		controller.abort()
	}, 8000)
	const hostDiv = document.createElement('div')
	hostDiv.onclick = () => {
		copyToClip(url)
	}
	div.appendChild(hostDiv)
	try {
		await fetch('https://' + url + '/fakepage.html', config)
			.then((response) => {
				clearTimeout(abortTimeout)
				// With mode: 'no-cors', a successful response is opaque (status 0).
				// Any response means the request was NOT blocked.
				parent.style.background = 'var(--red)'
				hostDiv.innerHTML = icons['x'] + '<span>' + url + '</span>'
				abt.notblocked += 1
				Object.assign(abt.hosts[k1][k2], { [url]: false })
				tslog += '<br> ' + url + ' - not blocked'
			})
			.catch((error) => {
				clearTimeout(abortTimeout)
				// Network error or abort = request was blocked
				hostDiv.innerHTML = icons['v'] + '<span>' + url + '</span>'
				abt.blocked += 1
				Object.assign(abt.hosts[k1][k2], { [url]: true })
				tslog += '<br> ' + url + ' - blocked'
			})
	} catch (error) {
		clearTimeout(abortTimeout)
	}
}

// Track elements that already have click listeners
const _clickListenerElements = new WeakSet()

//Function to collapse a test
function collapse_category(cc, c) {
	const others = document.querySelectorAll('.test_collapse')
	others.forEach((element) => {
		if (cc == true) element.parentElement.classList.add('show')
		else element.parentElement.classList.remove('show')
		if (c == true && !_clickListenerElements.has(element)) {
			_clickListenerElements.add(element)
			element.addEventListener('click', () => {
				element.parentElement.classList.toggle('show')
			})
		}
	})
}

// Function to fetch all the tests
async function fetchTests() {
	let fetches = []
	Object.keys(data).forEach((key) => {
		if (key == 'default') return
		const catEl = document.createElement('div')
		catEl.className = 'grid'
		catEl.id = key
		catEl.innerHTML =
			'<div><h5>' + icons[key] + '&nbsp;&nbsp;' + key + '</h5><div>'
		testWrapper.appendChild(catEl)
		const category = data[key]
		let total_hosts = 0
		abt.hosts[key] = {}
		const dd_left = document.createElement('div')
		dd_left.classList.add('col-6')
		const dd_right = document.createElement('div')
		dd_right.classList.add('col-6')

		catEl.appendChild(dd_left)
		catEl.appendChild(dd_right)
		let i = 0
		Object.keys(category).forEach((keyC) => {
			const testInfo = document.createElement('div')
			let tests_count = 0
			const div = document.createElement('div')
			const dw = document.createElement('div')
			div.classList.add('test')
			div.id = keyC
			div.style.background = 'var(--green)'
			let tc = icons[keyC] != undefined ? icons[keyC] + '&nbsp' : ''
			div.innerHTML =
				"<span class='test_collapse'>" + tc + keyC + '</span>'
			div.appendChild(dw)
			if (i % 2 == 0) {
				dd_left.appendChild(div)
			} else {
				dd_right.appendChild(div)
			}
			i++
			Object.assign(abt.hosts[key], { [keyC]: {} })
			if (Object.prototype.hasOwnProperty.call(category, keyC)) {
				const value = category[keyC]
				for (let j = 0; j < value.length; j++) {
					fetches.push(
						check_url(value[j], dw, div, key, keyC).then(() => {
							set_liquid()
						})
					)
					tests_count++
				}
			}
			testInfo.innerHTML = keyC + ' => n° tests => ' + tests_count
			test_log.appendChild(testInfo)
			total_hosts += tests_count
		})
		const total_tests = document.createElement('div')
		total_tests.innerHTML =
			key +
			' => Total n° tests => ' +
			total_hosts +
			'<br> ------------------------- '
		test_log.appendChild(total_tests)
	})

	await Promise.all(fetches)
}

function ad_script_test() {
	const log = document.createElement('div')
	const sfa1 = document.querySelector('#sfa_1')
	const sfa2 = document.querySelector('#sfa_2')

	abt.script.ads = typeof s_test_ads == 'undefined'
	abt.script.pagead = typeof s_test_pagead == 'undefined'
	sfa1.classList.add(abt.script.ads ? '_bg-green' : '_bg-red')
	sfa2.classList.add(abt.script.pagead ? '_bg-green' : '_bg-red')
	abt.blocked += (abt.script.ads ? 1 : 0) + (abt.script.pagead ? 1 : 0)
	abt.notblocked += (abt.script.ads ? 0 : 1) + (abt.script.pagead ? 0 : 1)
	test_log.appendChild(log)
	log.innerHTML =
		'<div>script_ads : ' +
		abt.script.ads +
		'</div><div>script_pagead : ' +
		abt.script.pagead +
		'</div><br> ------------------------- '
	set_liquid()
}
const ctd = document.querySelector('#ctd_test')

//Static — returns a promise so Promise.all can wait for it (#25)
function cosmetic_test_static() {
	return new Promise((resolve) => {
		setTimeout(function () {
			const cts = document.querySelector('#cts_test')
			abt.cosmetic_test.static =
				!(cts.clientHeight || cts.offsetHeight) ? true : false
			abt.blocked += abt.cosmetic_test.static ? 1 : 0
			abt.notblocked += abt.cosmetic_test.static ? 0 : 1
			document
				.querySelector('#ct_static')
				.classList.add(abt.cosmetic_test.static ? '_bg-green' : '_bg-red')
			const log = document.createElement('div')
			test_log.appendChild(log)
			log.innerHTML =
				' cosmetic_static_ad : ' +
				abt.cosmetic_test.static +
				'<br><br> ------------------------- '
			set_liquid()
			resolve()
		}, 1200)
	})
}
//Dynamic — returns a promise so Promise.all can wait for it (#25)
function cosmetic_test_dynamic() {
	return new Promise((resolve) => {
		const log = document.createElement('div')
		const ad = document.createElement('div')
		ad.id = 'ad_ctd'
		ad.className =
			'textads banner-ads banner_ads ad-unit afs_ads ad-zone ad-space adsbox'
		ad.innerHTML = '&nbsp;'
		ctd.appendChild(ad)
		setTimeout(function () {
			const adt = document.querySelector('#ad_ctd')
			abt.cosmetic_test.dynamic =
				!(adt.offsetHeight || adt.clientHeight) ? true : false
			abt.blocked += abt.cosmetic_test.dynamic ? 1 : 0
			abt.notblocked += abt.cosmetic_test.dynamic ? 0 : 1
			test_log.appendChild(log)
			log.innerHTML =
				' cosmetic_dynamic_ad : ' +
				abt.cosmetic_test.dynamic +
				'<br><br> ------------------------- '
			document
				.querySelector('#ct_dynamic')
				.classList.add(
					abt.cosmetic_test.dynamic ? '_bg-green' : '_bg-red'
				)
			set_liquid()
			resolve()
		}, 1200)
	})
}

const lt_particles = document.querySelector('.lt_particles')
const lt_cwrap = document.querySelector('.lt_cwrap')
async function startAdBlockTesting() {
	resetTestState()
	// Pre-calculate total so percentage doesn't jump (#5)
	abt.total = countTotalTests()
	if (settings['showCF'] == true) {
		abt.total += 2
	}
	if (settings['showSL'] == true) {
		abt.total += 2
	}

	document.querySelector('.lt_wrap').classList.add('start')
	lt_cwrap.classList.add('start')
	let tests = []
	if (settings['showCF'] == true) {
		tests.push(cosmetic_test_static())
		tests.push(cosmetic_test_dynamic())
	} else {
		document.querySelector('#cf_wrap').style.display = 'none'
	}
	if (settings['showSL'] == true) {
		tests.push(ad_script_test())
	} else {
		document.querySelector('#sl_wrap').style.display = 'none'
	}

	tests.push(fetchTests())
	await Promise.all(tests)
}
function set_liquid() {
	const p = (100 / abt.total) * abt.blocked
	const c =
		p > 30 ? (p > 60 ? 'var(--green)' : 'var(--orange)') : 'var(--red)'
	document.body.style.setProperty('--liquid-percentage', 45 - p + '%')
	document.body.style.setProperty('--liquid-color', c)
	document.body.style.setProperty(
		'--liquid-title',
		"'" + Math.round(p) + "%'"
	)
}

function stopAdBlockTesting() {
	fadeOut(lt_particles, () => {
		document.querySelector('.lt_wrap').classList.remove('start')
		fadeIn(lt_particles, 'flex')
		document.body.classList.remove('_overflowhidden')
	})
	lt_cwrap.classList.remove('start')
}
function render_tests() {
	const r_wrap = document.querySelector('.r_wrap')
	r_wrap.innerHTML = ''
	results.forEach((r, index) => {
		const div = document.createElement('div')
		div.className = 'col-6'
		const abt_r = results[index].abt
		const t =
			'<span>' +
			icons['cdot'] +
			'Total : ' +
			abt_r.total +
			'</span><br><span>' +
			icons['x'] +
			' ' +
			abt_r.notblocked +
			' not blocked</span><span>' +
			icons['v'] +
			' ' +
			abt_r.blocked +
			' blocked</span>'
		div.innerHTML =
			"<div class='card'><div>" +
			t +
			'<br><h6>' +
			r.date +
			'</h6></div><div><button class="btn-blue outline" data-r=' +
			r['time'] +
			'>' +
			icons['download'] +
			'</button></div></div>'
		r_wrap.insertBefore(div, r_wrap.children[0])
	})
	if (!r_wrap._delegated) {
		r_wrap.addEventListener('click', (e) => {
			const btn = e.target.closest('button[data-r]')
			if (btn) downloadResult(btn.getAttribute('data-r'))
		})
		r_wrap._delegated = true
	}
}

function leading_zero(val) {
	return (val < 10 ? '0' : '') + val
}

function add_report() {
	const ms = Date.now()
	const date = new Date(ms)
	const d =
		date.getDate() +
		'/' +
		(date.getMonth() + 1) +
		'/' +
		date.getFullYear() +
		' ' +
		leading_zero(date.getHours()) +
		':' +
		leading_zero(date.getMinutes()) +
		':' +
		leading_zero(date.getSeconds())
	// Deep copy abt to avoid reference issues (#7)
	const abtSnapshot = JSON.parse(JSON.stringify(abt))
	if (results.length < 10) {
		results.push({ time: ms, date: d, note: '', abt: abtSnapshot })
	} else {
		results.splice(0, 1)
		results.push({ time: ms, date: d, note: '', abt: abtSnapshot })
	}
	LS.set('results', results)
	render_tests()
}
const el = (l) => {
	return document.querySelector(l)
}

document.addEventListener('DOMContentLoaded', function () {
	new navbar()
	new themeManager()
	document.querySelectorAll('.theme-toggle').forEach(function (toggle) {
		toggle.addEventListener('keydown', function (e) {
			if (e.keyCode === 13 || e.keyCode === 32) {
				e.preventDefault()
				toggle.click()
			}
		})
	})
	new gotop()
	new aos()
	for (const key in settings) {
		try {
			const c = document.querySelector('#' + key)
			c.checked = settings[key]
			c.addEventListener('change', () => {
				settings[key] = c.checked
				if (key == 'collapseAll')
					collapse_category(settings[key], false)
				LS.set('settings', settings)
			})
		} catch (error) {
			// Setting element not found, skip
		}
	}
	render_tests()

	function runTest() {
		startAdBlockTesting().then(() => {
			collapse_category(settings['collapseAll'], true)
			setTimeout(() => {
				stopAdBlockTesting()
				add_report()
				const tsl = document.createElement('div')
				tslog +=
					'<br>-----<br> Total : ' +
					abt.total +
					'<br> Blocked : ' +
					abt.blocked +
					'<br> Not Blocked : ' +
					abt.notblocked
				tsl.innerHTML = tslog
				test_log.appendChild(tsl)
				fadeIn(document.querySelector('#adb_test'), 'flex')
				const r = document.querySelector('#adb_test_r')

				r.innerHTML =
					'<span>' +
					icons['cdot'] +
					' Total : ' +
					abt.total +
					'</span><span>' +
					icons['v'] +
					' ' +
					abt.blocked +
					' blocked</span><span>' +
					icons['x'] +
					' ' +
					abt.notblocked +
					' not blocked </span>'
			}, 2000)
		})
	}

	// Delay test start to allow LCP to complete first
	const startDeferred = () => setTimeout(runTest, 100)
	if ('requestIdleCallback' in window) {
		requestIdleCallback(startDeferred, { timeout: 2000 })
	} else {
		setTimeout(startDeferred, 1000)
	}

	document.querySelector('#start_test').addEventListener('click', () => {
		location.reload()
	})
	const stxt =
		'https://raw.githubusercontent.com/Turtlecute33/Toolz/master/src/d3host.txt'
	const sadblock =
		'https://raw.githubusercontent.com/Turtlecute33/Toolz/master/src/d3host.adblock'
	document
		.querySelector('#hostListTxt')
		.addEventListener('click', function () {
			copyToClip(stxt)
		})
	el('#hostListAdblock').addEventListener('click', function () {
		copyToClip(sadblock)
	})
})
