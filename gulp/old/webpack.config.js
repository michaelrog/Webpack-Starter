var webpack = require('webpack');

module.oldExports = {

	devServer: {
		historyApiFallback: true,
		noInfo: true
	},

	devtool: '#source-map',

	module: {

		rules: [

			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {},
			},

			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},

			{
				test: /\.(png|jpg|gif|svg)$/,
				loader: 'file-loader',
				options: {
					name: '[name].[ext]?[hash]'
				}
			}

		]

	},

	performance: {
		hints: false
	},

	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,
			compress: {
				warnings: false
			}
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		})
	],

	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.esm.js'
		}
	},

};

module.exports = {

};
