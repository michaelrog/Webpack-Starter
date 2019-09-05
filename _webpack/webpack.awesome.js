const LEGACY_CONFIG = 'legacy';
const MODERN_CONFIG = 'modern';

/*
 * Node modules
 */
const _path = require('path');
const _merge = require('webpack-merge');

/*
 * Webpack plugins
 */
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');

/*
 * Setup files
 */
const pkg = require('../package.json');
const settings = require('./project.settings.js');
const project = require('./project.helpers.js');


/**
 * Provides an array of Webpack rules definitions that handle JS compilation via `babel-loader`
 *
 * @param browserList
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
 * Configuration for ManifestPlugin plugin
 * @see https://github.com/danethurber/webpack-manifest-plugin
 *
 * @param fileName
 *
 * @returns Object
 */
const ManifestPluginOptions = (fileName) => {
    return {
        fileName: fileName,
    };
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
            filename: 'svg/' + name + '.[contenthash].svg'
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


module.exports = (env, argv) => {
    console.log("process.env.NODE_ENV:", process.env.NODE_ENV);
    return [
        {
            name: 'default',
            entry: settings.paths.source.js + 'main.js',
            output: {
                path: project.getDistPath(),
                publicPath: settings.paths.dist.publicPath,
                filename: '[name].[chunkhashs].js'
            },
            resolve: {
                alias: {
                    'vue$': 'vue/dist/vue.esm.js'
                }
            },
            mode: project.getMode(),
            devtool: project.inProduction() ? 'source-map' : 'inline-source-map',
            module: {
                rules: [
                    ...BabelLoaderRules(pkg.browserslist.modernBrowsers),
                    ...VueLoaderRules(),
                    ...FontLoaderRules(),
                ]
            },
            plugins: [
                ...SVGSpritemapPluginInstances(),
                new ManifestPlugin(
                    ManifestPluginOptions('manifest-modern.json')
                ),
            ],
        },
        {
            name: 'legacy',
            entry: settings.paths.source.js + 'main.js',
            output: {
                path: project.getDistPath('legacy'),
                publicPath: settings.paths.dist.publicPath + 'legacy/',
                filename: '[name].[chunkhashs].js'
            },
            resolve: {
                alias: {
                    'vue$': 'vue/dist/vue.esm.js'
                }
            },
            mode: project.getMode(),
            devtool: project.inProduction() ? 'source-map' : 'inline-source-map',
            module: {
                rules: [
                    ...BabelLoaderRules(pkg.browserslist.legacyBrowsers),
                    ...FontLoaderRules(),
                ]
            },
            plugins: [
                new ManifestPlugin(
                    ManifestPluginOptions('manifest-other.json')
                ),
                /*
                 * We only include the CleanWebpackPlugin in the last build child.
                 * Otherwise, it'd nuke things prematurely and cause directory-not-found errors.
                 */
                new CleanWebpackPlugin(
                    CleanWebpackPluginOptions(project.getDistPath())
                ),
            ],
        }
    ];
};
