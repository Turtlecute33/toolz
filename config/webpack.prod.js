const main = require('./webpack.main')
const { merge } = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

module.exports = merge(main, {
	mode: 'production',
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				test: /\.js(\?.*)?$/i,
				terserOptions: {
					compress: {
						drop_console: false,
						pure_funcs: ['console.log']
					},
					output: {
						comments: false
					}
				},
				extractComments: false
			}),
			new CssMinimizerPlugin({
				minimizerOptions: {
					preset: [
						'default',
						{
							discardComments: { removeAll: true }
						}
					]
				}
			})
		],
		splitChunks: {
			chunks: 'all',
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					priority: 10
				}
			}
		}
	},
	plugins: [new CleanWebpackPlugin()],
	performance: {
		hints: 'warning',
		maxEntrypointSize: 512000,
		maxAssetSize: 512000
	}
})
