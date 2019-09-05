const LEGACY_CONFIG = 'legacy';
const MODERN_CONFIG = 'modern';

// node modules
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

// webpack plugins
const DashboardPlugin = require('webpack-dashboard/plugin');

// config files
const common = require('./webpack.common.js');
const pkg = require('../package.json');
const settings = require('./project.settings.js');

// Configure the webpack-dev-server
const DevServerConfig = (buildType) => {
    console.log("DIRNAME");
    console.log(__dirname);
    return {
        public: settings.devServerConfig.public(),
        contentBase: path.resolve(__dirname, settings.paths.source.templates),
        host: settings.devServerConfig.host(),
        port: settings.devServerConfig.port(),
        https: !!parseInt(settings.devServerConfig.https()),
        disableHostCheck: false,
        hot: true,
        overlay: true,
        watchContentBase: true,
        watchOptions: {
            poll: !!parseInt(settings.devServerConfig.poll()),
            ignored: /node_modules/,
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
            'X-WebpackDevServer': settings.devServerConfig.public()
        },
    };
};

// Configure the Postcss loader
const PostcssLoaderRules = (buildType) => {
    switch(buildType) {
        case LEGACY_CONFIG:
            // Don't generate CSS for the legacy config in development.
            return {
                test: /\.(pcss|css)$/,
                loader: 'ignore-loader'
            };
        case MODERN_CONFIG:
            return {
                test: /\.(pcss|css)$/,
                use: [
                    // {
                    //     loader: 'style-loader',
                    // },
                    // {
                    //     loader: 'vue-style-loader',
                    // },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            sourceMap: true
                        }
                    },
                    // {
                    //     loader: 'resolve-url-loader'
                    // },
                    {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [],
                            sourceMap: true
                        }
                    }
                ]
            };
        default:
            break;
    }
};

// Development module exports
module.exports = [
    merge(
        common.legacyConfig,
        {
            output: {
                filename: path.join('./js', '[name]-legacy.[hash].js'),
                publicPath: settings.devServerConfig.public() + '/',
            },
            mode: 'development',
            devtool: 'inline-source-map',
            devServer: DevServerConfig(LEGACY_CONFIG),
            module: {
                rules: [
                    PostcssLoaderRules(LEGACY_CONFIG),
                ],
            },
            plugins: [
                new webpack.HotModuleReplacementPlugin(),
            ],
        }
    ),
    merge(
        common.modernConfig,
        {
            output: {
                filename: path.join('./js', '[name].[hash].js'),
                publicPath: settings.devServerConfig.public() + '/',
            },
            mode: 'development',
            devtool: 'inline-source-map',
            devServer: DevServerConfig(MODERN_CONFIG),
            module: {
                rules: [
                    PostcssLoaderRules(MODERN_CONFIG),
                ],
            },
            plugins: [
                new webpack.HotModuleReplacementPlugin(),
                new DashboardPlugin(),
            ],
        }
    ),
];
