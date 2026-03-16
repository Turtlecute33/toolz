export class LocalStorageManager {
	constructor(name) {
		this.LS = null
		this.name = name
		this.data = {}
		this.checkLS()
		this.init(name)
	}
	clearAll() {
		if (this.LS) this.LS.clear()
	}
	checkLS() {
		if (window && window.localStorage) {
			this.LS = window.localStorage
		}
	}
	init(name) {
		if (this.LS && this.LS[name]) {
			try {
				this.data = JSON.parse(this.LS[name])
			} catch (e) {
				this.data = {}
			}
		}
	}

	set(uri, data) {
		this.data[uri] = data
		if (this.LS) {
			this.LS[this.name] = JSON.stringify(this.data)
		}
	}

	get(uri) {
		if (uri in this.data) {
			return this.data[uri]
		}
		return false
	}
}
