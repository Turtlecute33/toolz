module.exports = {
	env: {
		browser: true,
		es6: true
	},
	extends: ['eslint:recommended', 'prettier'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
		globalThis: 'readonly',
		s_test_ads: 'readonly',
		s_test_pagead: 'readonly'
	},
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module'
	},
	rules: {
		'no-unused-vars': 'warn'
	},
	overrides: [
		{
			files: ['src/js/components/dialog.js'],
			env: {
				browser: true,
				amd: true,
				commonjs: true
			}
		},
		{
			files: ['src/script/**/*.js'],
			env: {
				node: true,
				browser: false
			}
		}
	]
}
