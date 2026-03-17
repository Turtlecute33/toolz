export class LocalStorageManager {
	constructor(name) {
		this.LS = null
		this.name = name
		this.data = {}
		this.checkLS()
		this.init(name)
	}

	isPlainObject(value) {
		return value !== null && typeof value === 'object' && !Array.isArray(value)
	}

	clearAll() {
		if (!this.LS) return
		try {
			this.LS.removeItem(this.name)
			this.data = {}
		} catch (e) {
			this.LS = null
		}
	}
	checkLS() {
		try {
			if (typeof window !== 'undefined' && window.localStorage) {
				this.LS = window.localStorage
			}
		} catch (e) {
			this.LS = null
		}
	}
	init(name) {
		if (this.LS) {
			try {
				const stored = this.LS.getItem(name)
				if (stored) {
					const parsed = JSON.parse(stored)
					this.data = this.isPlainObject(parsed) ? parsed : {}
					if (!this.isPlainObject(parsed)) this.LS.removeItem(name)
				}
			} catch (e) {
				this.data = {}
				try {
					this.LS.removeItem(name)
				} catch (removeError) {
					this.LS = null
				}
			}
		}
	}

	set(uri, data) {
		this.data[uri] = data
		if (this.LS) {
			try {
				this.LS.setItem(this.name, JSON.stringify(this.data))
			} catch (e) {
				this.LS = null
			}
		}
	}

	get(uri) {
		if (uri in this.data) {
			return this.data[uri]
		}
		return null
	}
}
