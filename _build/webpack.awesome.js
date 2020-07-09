/*
 * Webpack plugins
 */
const CopyPlugin = require('copy-webpack-plugin');
const CriticalCssPlugin = require('critical-css-webpack-plugin');
const Del = require('del');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SaveRemoteFilePlugin = require('./SaveRemoteFilePlugin');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
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
 * Configuration options for CriticalCssPlugin
 * @see https://www.npmjs.com/package/critical-css-webpack-plugin
 *
 * @param name
 * @param url
 * @param amp
 *
 * @returns Object
 */
const CriticalCssPluginOptions = (name, url, amp) => {

    return {
        src: settings.criticalCss.baseUrl + url,
        dest: project.getDistPath(settings.criticalCss.destPath, (name + settings.criticalCss.suffix)),
        extract: false,
        inline: false,
        minify: true,
        dimensions: (amp ? settings.criticalCss.ampDimensions : settings.criticalCss.dimensions),
    };

};

/**
 * Generates an instance of CriticalCssPlugin for each entry in `settings.criticalCss.entries` and `settings.criticalCss.ampEntries`.
 * (These instances will be merged into `module.exports.plugins` to spawn Critical CSS extraction for various routes.)
 *
 * @returns Array
 */
const CriticalCssPluginInstances = () => {

    let instances = [];
    // Normal views
    for ([name, url] of Object.entries(settings.criticalCss.entries)) {
        let instance = new CriticalCssPlugin(CriticalCssPluginOptions(name, url, false));
        instances.push(instance);
    }
    // AMP views
    for ([name, url] of Object.entries(settings.criticalCss.ampEntries)) {
        let instance = new CriticalCssPlugin(CriticalCssPluginOptions(name, url, true));
        instances.push(instance);
    }
    return instances;

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

        host: settings.devServerConfig.host || 'localhost',
        https: settings.devServerConfig.https || false,
        port: settings.devServerConfig.port || 8080,
        public: settings.devServerConfig.public ||
            ((settings.devServerConfig.host || 'localhost') + ':' + (settings.devServerConfig.port || 8080)),

        compress: true,
        contentBase: settings.devServerConfig.contentBase,
        disableHostCheck: false,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'X-ServedByWebpackDevServer': '',
        },
        overlay: true,
        // proxy: settings.devServerConfig.proxy || null,
        watchContentBase: true,
        watchOptions: {
            poll: settings.devServerConfig.poll || null,
            ignored: [/(node_modules|bower_components)/, ...(settings.devServerConfig.ignored || [])],
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
 * Generates an instance of SaveRemoteFilePlugin for each entry in `settings.saveRemoteFileConfig`.
 * (These instances will be merged into `module.exports.plugins` to include remote files in production builds.)
 *
 * @returns Array
 */
const SaveRemoteFilePluginInstances = () => {

    let instances = [];

    settings.saveRemoteFileConfig.forEach(function (entry) {
        let instance = new SaveRemoteFilePlugin(
            {
                url: entry.url,
                filepath: entry.filepath,
                hash: includeFilenameHashes,
            }
        );
        instances.push(instance);
    });

    return instances;

};

/**
 * Provides an array of Webpack rules definitions that handle CSS compilation via postcss-loader, etc.
 *
 * @returns Object[]
 */
const StyleCompilationRules = () => {

    const MiniCssExtractPluginLoader = {
        loader: MiniCssExtractPlugin.loader,
        options: {
            hmr: project.inDev(),
            reloadAll: null,
        },
    };

    const CssLoader = {
        loader: 'css-loader',
        options: {
            importLoaders: 1,
            sourceMap: true
        }
    };

    return [
        {
            test: /\.(pcss)$/,
            use: [
                MiniCssExtractPluginLoader,
                CssLoader,
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
        },
        {
            test: /\.(css)$/,
            use: [
                MiniCssExtractPluginLoader,
                CssLoader,
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

    const defaultOptions = {
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
                ...BabelLoaderRules(pkg.browserslist.legacyBrowsers),
                ...FontLoaderRules(),
                ...StyleCompilationRules(),
                ...VueLoaderRules(),
            ]
        },
        plugins: [
            ...(project.inProduction() ? [new CopyPlugin(settings.copyPluginConfig)] : []),
            ...(project.inProduction() ? SaveRemoteFilePluginInstances() : []),
            ...SVGSpritemapPluginInstances(),
            ...(project.inProduction() ? CriticalCssPluginInstances() : []),
            new MiniCssExtractPlugin({
                filename: '[name]' + (includeFilenameHashes ? '.[contenthash]' : '') +  '.css',
            }),
            new WebpackManifestPlugin(
                WebpackManifestPluginOptions('manifest-default.json')
            ),
        ],
    };

    const modernOptions = {
        ...commonOptions,
        name: 'modern',
        entry: settings.entries.modern,
        output: {
            path: project.getDistPath(''),
            publicPath: settings.paths.dist.publicPath,
            filename: '[name].modern' + (includeFilenameHashes ? '.[chunkhash]' : '') + '.js'
        },
        module: {
            rules: [
                ...BabelLoaderRules(pkg.browserslist.modernBrowsers),
                ...FontLoaderRules(),
            ]
        },
        plugins: [
            new WebpackManifestPlugin(
                WebpackManifestPluginOptions('manifest-modern.json')
            )
        ],
    };

    // Some useful info
    console.table({
        'webpack.mode': project.getMode(),
        'devServerConfig.public': settings.devServerConfig.public,
    });

    // Clean out the output directory
    if (project.inProduction()) {
        let cleanedFiles = Del.sync([project.getDistPath('**/*')]);
        console.log("Cleaning the output directory...", cleanedFiles);
    }

    // Webpack speed profiler
    const smp = new SpeedMeasurePlugin();

    // ...and away... we... go.
    return [
        smp.wrap(defaultOptions),
        smp.wrap(modernOptions),
    ];

};
