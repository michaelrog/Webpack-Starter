// node modules
require('dotenv').config();

const asBoolean = function(val) { return val === 'Y' || val === 'y' || parseInt(val) === 1; };

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
		templates: "./source/craft-templates/",
	},
	dist: {
		base: "./web/dist/",
		publicPath: process.env.PUBLIC_PATH || "/dist/",
	}
};

settings.urls = {
	base: process.env.BASE_URL,
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
	modern: {
		'main': settings.paths.source.js + 'main.js',
	},
};

settings.webpack = {
	includeFilenameHashes: asBoolean(process.env.WEBPACK_INCLUDE_FILENAME_HASHES) || false,
	clean: true,
};

settings.babelLoaderConfig = {
	exclude: [
		/(node_modules|bower_components)/
	],
};

settings.criticalCss = {
	destPath: "critical",
	suffix: ".critical.min.css",
	baseUrl: settings.urls.base,
	dimensions: [
		{
			height: 1200,
			width: 1200,
		}
	],
	entries: {
		'index': '',
	},
	ampDimensions: [
		{
			height: 19200,
			width: 600,
		}
	],
	ampEntries: {
		'amp-index': '',
	}
};


settings.purgeCssConfig = {
	paths: [
		"./web/**.{html}",
		"./source/craft-templates/**/*.{twig,html}",
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

settings.saveRemoteFileConfig = [
	{
		url: "https://www.google-analytics.com/analytics.js",
		filepath: "google-analytics.js"
	}
];

settings.devServerConfig = {
    public: process.env.DEVSERVER_PUBLIC || "http://localhost:8080",
    host: process.env.DEVSERVER_HOST || "localhost",
    port: process.env.DEVSERVER_PORT || 8080,
    https: asBoolean(process.env.DEVSERVER_HTTPS) || false,
    poll: asBoolean(process.env.DEVSERVER_POLL) || false,
    ignored: [
        /(node_modules|bower_components)/
    ],
	proxy: process.env.DEVSERVER_PROXY_HOST || null,
};


// Webpack project settings exports
// noinspection WebpackConfigHighlighting
module.exports = settings;






const unusedSettings = {
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
};
