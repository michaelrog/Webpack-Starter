import path from 'path';
import vueLoader from 'vue-loader'
import webpack from 'webpack';


let devConfig = {

    mode: 'development',

    entry: {
        main: [
            './source/js/modern/main.js',
            'webpack/hot/dev-server',
            // 'webpack-hot-middleware/client'
        ],
    },

    output: {
        filename: 'dist/scripts/[name].js',
        path: path.resolve(__dirname, '../../public/'),
    },

    context: path.resolve(__dirname, '../..'),

    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            },
        ]
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new vueLoader.VueLoaderPlugin(),
    ],

    devServer: {
        publicPath: '/dist/scripts/',
        compress: true,
        headers: {
            'X-Webpack': 'devServer'
        }
    }



};

let buildConfig = {

    entry: {
        main: [
            './source/js/modern/main.js',
        ],
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../../public/dist/scripts'),
    },

    context: path.resolve(__dirname, '../..'),

    mode: 'production',

};

module.exports = { devConfig, buildConfig };
