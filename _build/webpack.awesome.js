/*
 * Webpack plugins
 */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');
const WebpackManifestPlugin = require('webpack-manifest-plugin');

/*
 * Setup files
 */
const pkg = require('../package.json');
const settings = require('./project.settings.js');
const project = require('./project.helpers.js');

/*
 *
 */
const includeFilenameHashes = !!parseInt(settings.webpack.includeFilenameHashes);

/**
 * Provides an array of Webpack rules definitions that handle JS compilation via `babel-loader`
 *
 * @param browsers
 *
 * @returns Object[]
 */
const BabelLoaderRules = (browsers) => {
    return [
        {
            test: /\.js$/,
            exclude: settings.babelLoaderConfig.exclude,
            use: {
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                modules: false,
                                corejs:  {
                                    version: 3,
                                    proposals: true
                                },
                                useBuiltIns: 'usage',
                                targets: {
                                    browsers: Object.values(browsers),
                                },
                            }
                        ],
                    ],
                    plugins: [
                        '@babel/plugin-syntax-dynamic-import',
                        '@babel/plugin-transform-runtime',
                    ],
                },
            },
        },
    ];
};


/**
 * Configuration for CleanWebpack plugin
 * @see https://github.com/johnagan/clean-webpack-plugin
 *
 * @param root
 *
 * @returns Object
 */
const CleanWebpackPluginOptions = (root) => {
    return {
        root: root,
        verbose: true,
        dry: false
    };
};

/**
 * Configure the webpack-dev-server
 *
 * @param buildType
 *
 * @returns Object
 */
const DevServerConfig = () => {

    return {
        public: settings.devServerConfig.public,
        contentBase: project.getProjectPath(settings.paths.source.templates),
        host: settings.devServerConfig.host,
        port: settings.devServerConfig.port,
        https: !!parseInt(settings.devServerConfig.https),
        disableHostCheck: true,
        proxy: settings.devServerConfig.proxy ? {
            '*': {
                target: settings.devServerConfig.proxy,
                changeOrigin: true,
            }
        } : null,
        hot: true,
        overlay: true,
        watchContentBase: true,
        watchOptions: {
            poll: !!parseInt(settings.devServerConfig.poll),
            ignored: settings.devServerConfig.ignored,
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
            'X-WebpackDevServer': settings.devServerConfig.public
        },
    };
};

/**
 * Provides an array of Webpack rules definitions that handle fonts (i.e. copying them to dist via file-loader).
 *
 * @returns Object[]
 */
const FontLoaderRules = () => {
    return [
        {
            test: /\.(ttf|eot|woff2?)$/i,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: 'fonts/[name].[ext]'
                    }
                }
            ]
        }
    ];
};

/**
 * Provides an array of Webpack rules definitions that handle CSS compilation via postcss-loader, etc.
 *
 * @returns Object[]
 */
const StyleCompilationRules = () => {
    return [
        {
            test: /\.(pcss|css)$/,
            use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        hmr: project.inDev(),
                        // reloadAll: true,
                    },
                },
                {
                    loader: 'css-loader',
                    options: {
                        importLoaders: 1,
                        sourceMap: true
                    }
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        config: {
                            path: './_build/',
                        },
                        sourceMap: true
                    }
                }
            ]
        }
    ];
};

/**
 * Configuration options for SVGSpritemap plugin
 * @see https://github.com/cascornelissen/svg-spritemap-webpack-plugin/blob/master/docs/options.md
 *
 * @param name
 *
 * @returns Object
 */
const SVGSpritemapPluginOptions = (name) => {
    return {
        output: {
            chunk: {
                name: name,
            },
            filename: 'svg/' + name + (includeFilenameHashes ? '.[contenthash]' : '') + '.svg'
        },
        sprite: {
            prefix: false,
                generate: {
                use: true,
            }
        }
    }
};

/**
 * Generates an instance of SVGSpritemapPlugin for each entry in `settings.svgSprites`.
 * (These instances will be merged into `module.exports.plugins` to spawn SVG sprite generation.)
 *
 * @returns Array
 */
const SVGSpritemapPluginInstances = () => {
    let instances = [];
    for ([name, path] of Object.entries(settings.svgSprites)) {
        let instance = new SVGSpritemapPlugin(settings.paths.source.svg + path, SVGSpritemapPluginOptions(name));
        instances.push(instance);
    }
    return instances;
};

/**
 * Provides an array of Webpack rules definitions that handle Vue component files via `vue-loader`.
 *
 * @returns Object[]
 */
const VueLoaderRules = () => {
    return [
        {
            test: /\.vue$/,
            loader: 'vue-loader'
        }
    ];
};

/**
 * Configuration for WebpackManifestPlugin plugin
 * @see https://github.com/danethurber/webpack-manifest-plugin
 *
 * @param fileName
 *
 * @returns Object
 */
const WebpackManifestPluginOptions = (fileName) => {
    return {
        fileName: fileName,
    };
};



module.exports = (env, argv) => {

    console.table({
        'process.env.NODE_ENV': process.env.NODE_ENV,
        'devServerConfig.public': settings.devServerConfig.public,
    });

    const commonOptions = {
        resolve: {
            alias: {
                'vue$': 'vue/dist/vue.esm.js'
            }
        },
        mode: project.getMode(),
        devServer: DevServerConfig(),
        devtool: project.inProduction() ? 'source-map' : 'inline-source-map',
    };

    return [
        {
            ...commonOptions,
            name: 'default',
            entry: settings.entries.default,
            output: {
                path: project.getDistPath(''),
                publicPath: settings.paths.dist.publicPath,
                filename: '[name]' + (includeFilenameHashes ? '.[chunkhash]' : '') + '.js'
            },
            module: {
                rules: [
                    ...BabelLoaderRules(pkg.browserslist.modernBrowsers),
                    ...FontLoaderRules(),
                    ...StyleCompilationRules(),
                    ...VueLoaderRules(),
                ]
            },
            plugins: [
                // new CleanWebpackPlugin(
                //     CleanWebpackPluginOptions(project.getDistPath('default'))
                // ),
                ...SVGSpritemapPluginInstances(),
                new MiniCssExtractPlugin({
                    filename: '[name]' + (includeFilenameHashes ? '.[contenthash]' : '') +  '.css',
                }),
                new WebpackManifestPlugin(
                    WebpackManifestPluginOptions('manifest-default.json')
                ),

            ],
        },
        {
            ...commonOptions,
            name: 'legacy',
            entry: settings.entries.legacy,
            output: {
                path: project.getDistPath(''),
                publicPath: settings.paths.dist.publicPath,
                filename: '[name].legacy' + (includeFilenameHashes ? '.[chunkhash]' : '') + '.js'
            },
            module: {
                rules: [
                    ...BabelLoaderRules(pkg.browserslist.legacyBrowsers),
                    ...FontLoaderRules(),
                ]
            },
            plugins: [
                new CleanWebpackPlugin(
                    // CleanWebpackPluginOptions(project.getDistPath('legacy'))
                    CleanWebpackPluginOptions(project.getDistPath(''))
                ),
                new WebpackManifestPlugin(
                    WebpackManifestPluginOptions('manifest-legacy.json')
                )
            ],
        }
    ];
};
