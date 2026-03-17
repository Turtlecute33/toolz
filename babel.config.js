module.exports = {
	presets: [
		[
			'@babel/preset-env',
			{
				targets: '> 0.5%, last 2 versions, not dead',
				useBuiltIns: false
			}
		]
	]
}
