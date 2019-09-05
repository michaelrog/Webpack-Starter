const LEGACY_CONFIG = 'legacy';
const MODERN_CONFIG = 'modern';

// node modules
const path = require('path');
const merge = require('webpack-merge');

// webpack plugins
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

// config files
const pkg = require('../package.json');
const settings = require('./project.settings.js');

// Configure Babel loader
const BabelLoaderRules = (config) => {
    return {
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
                                browsers: config.browsers,
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
    };
};

// Configure Entries
const EntriesConfig = () => {
    let entries = {};
    for (const [key, value] of Object.entries(settings.entries)) {
        entries[key] = path.resolve(__dirname, settings.paths.source.js + value);
    }
    return entries;
};

// Configure Manifest
const ManifestPluginConfig = (fileName) => {
    return {
        fileName: fileName,
        basePath: settings.manifestConfig.basePath,
        map: (file) => {
            file.name = file.name.replace(/(\.[a-f0-9]{32})(\..*)$/, '$2');
            return file;
        },
    };
};

// Configure Vue loader
const VueLoaderRules = () => {
    return {
        test: /\.vue$/,
        loader: 'vue-loader'
    };
};

// The base webpack config
const baseConfig = {
    name: pkg.name,
    entry: EntriesConfig(),
    output: {
        path: path.resolve(__dirname, settings.paths.dist.base),
        publicPath: settings.urls.publicPath()
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    module: {
        rules: [
            VueLoaderRules(),
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
    ]
};

// Legacy webpack config
const legacyConfig = {
    module: {
        rules: [
            BabelLoaderRules({browsers: Object.values(pkg.browserslist.legacyBrowsers)}),
        ],
    },
    plugins: [
        new CopyWebpackPlugin(
            settings.copyWebpackConfig
        ),
        new ManifestPlugin(
            ManifestPluginConfig('manifest.legacy.json')
        ),
    ]
};

// Modern webpack config
const modernConfig = {
    module: {
        rules: [
            BabelLoaderRules({browsers: Object.values(pkg.browserslist.modernBrowsers)}),
        ],
    },
    plugins: [
        new ManifestPlugin(
            ManifestPluginConfig('manifest.json')
        ),
    ]
};

// Common module exports
// noinspection WebpackConfigHighlighting
module.exports = {
    'legacyConfig': merge.strategy({
        module: 'prepend',
        plugins: 'prepend',
    })(
        baseConfig,
        legacyConfig,
    ),
    'modernConfig': merge.strategy({
        module: 'prepend',
        plugins: 'prepend',
    })(
        baseConfig,
        modernConfig,
    ),
};
