// node modules
require('dotenv').config();


const settings = {
	name: "Rog-FE",
	copyright: "Michael Rog",
};

settings.paths = {
	source: {
		base: "./source/",
		css: "./source/css/",
		js: "./source/js/",
		svg: "./source/svg/",
		templates: "./source/templates/",
	},
	dist: {
		base: "./web/dist/",
		publicPath: process.env.PUBLIC_PATH || "/dist/",
	}
};

settings.urls = {
	publicPath: process.env.PUBLIC_PATH || "/dist/",
};

settings.svgSprites = {
	'icons': 'icons/*.svg',
	'logos': 'logos/*.svg',
};

settings.entries = {
	default: {
		'main': [
			settings.paths.source.js + 'main.js',
			settings.paths.source.css + 'main.pcss',
		],
	},
	legacy: {
		'main': settings.paths.source.js + 'main.js',
	},
};

settings.webpack = {
	includeFilenameHashes: process.env.WEBPACK_INCLUDE_FILENAME_HASHES || false,
};

settings.babelLoaderConfig = {
	exclude: [
		/(node_modules|bower_components)/
	],
};

settings.purgeCssConfig = {
	paths: [
		"./source/craft_templates/**/*.{twig,html}",
		"./source/vue/**/*.{vue,html}"
	],
	whitelist: [
		"./source/css/components/**/*.{css}"
	],
	whitelistPatterns: [],
	extensions: [
		'html',
		'js',
		'twig',
		'vue',
	],
};

settings.devServerConfig = {
    public: process.env.DEVSERVER_PUBLIC || "http://localhost:8080",
    host: process.env.DEVSERVER_HOST || "localhost",
    port: process.env.DEVSERVER_PORT || 8080,
    https: process.env.DEVSERVER_HTTPS || false,
    poll: process.env.DEVSERVER_POLL || false,
    ignored: [
        /(node_modules|bower_components)/
    ],
	proxy: process.env.DEVSERVER_PROXY_HOST || null,
};


// Webpack project settings exports
// noinspection WebpackConfigHighlighting
module.exports = settings;



const unusedSettings = {
	criticalCssConfig: {
		base: "./web/dist/criticalcss/",
		suffix: "_critical.min.css",
		criticalHeight: 1200,
		criticalWidth: 1200,
		ampPrefix: "amp_",
		ampCriticalHeight: 19200,
		ampCriticalWidth: 600,
		pages: [
			{
				url: "",
				template: "index"
			}
		]
	},
	devServerConfig: {
		public: () => process.env.DEVSERVER_PUBLIC || "http://localhost:8080",
		host: () => process.env.DEVSERVER_HOST || "localhost",
		poll: () => process.env.DEVSERVER_POLL || false,
		port: () => process.env.DEVSERVER_PORT || 8080,
		https: () => process.env.DEVSERVER_HTTPS || false,
	},
	copyWebpackConfig: [
		{
			from: "./source/js/workbox-catch-handler.js",
			to: "js/[name].[ext]"
		}
	],
	saveRemoteFileConfig: [
		{
			url: "https://www.google-analytics.com/analytics.js",
			filepath: "js/analytics.js"
		}
	],
	createSymlinkConfig: [
		{
			origin: "img/favicons/favicon.ico",
			symlink: "../favicon.ico"
		}
	],
	webappConfig: {
		logo: "./source/img/favicon.png",
		prefix: "img/favicons/"
	},
	workboxConfig: {
		swDest: "../sw.js",
		precacheManifestFilename: "js/precache-manifest.[manifestHash].js",
		importScripts: [
			"/dist/workbox-catch-handler.js"
		],
		exclude: [
			/\.(png|jpe?g|gif|svg|webp)$/i,
			/\.map$/,
			/^manifest.*\\.js(?:on)?$/,
		],
		globDirectory: "./web/",
		globPatterns: [
			"offline.html",
			"offline.svg"
		],
		offlineGoogleAnalytics: true,
		runtimeCaching: [
			{
				urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
				handler: "cacheFirst",
				options: {
					cacheName: "images",
					expiration: {
						maxEntries: 20
					}
				}
			}
		]
	},
	vars: {
		cssName: "styles"
	},
};
