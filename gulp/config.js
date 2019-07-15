/*
 * Load Webpack config
 */
const webpackConfig = require('./webpack.config.js');

/*
 * Set up base paths
 */

const src = './source';
const dist = './public/dist';

const paths = {

	src: {
		base: src,
		craftTemplates: src + '/craft_templates'
	},

	dist: {
		base: dist
	}

};

/*
 * Da beef.
 */

module.exports = {

	name: "ThinkChristian",

	paths,

	webpackConfig,

    browserSync: {

        files: [
	        paths.src.craftTemplates,
	        paths.dist.base + '/**/*.css',
	        paths.dist.base + '/**/*.js',
        ],
        proxy: 'tc.l'

    },

	livereload: {

		watched: [
			paths.src.craftTemplates + '/**/*.twig',
			paths.dist.base + '/**/*'
		]

	},

    jsBundles: [

        {
            name: 'libs',
            dest: dist + '/scripts',
            src: [
                // "./node_modules/lazysizes/lazysizes.js",
                	//x "./node_modules/lazysizes/plugins/unveilhooks/ls.unveilhooks.js",
                // "./node_modules/lazysizes/plugins/attrchange/ls.attrchange.js",
                // "./node_modules/lazysizes/plugins/bgset/ls.bgset.js",
                // "./node_modules/lazysizes/plugins/parent-fit/ls.parent-fit.js",
                	//x "./node_modules/isotope-layout/dist/isotope.pkgd.js",
            ],
            settings: {
                filename: 'libs',
            }
        },

    ],

	webpackBundles: [

		{
			name: 'main',
			dest: dist + '/scripts',
			src: [
                "./node_modules/lazysizes/lazysizes.js",
                "./node_modules/lazysizes/plugins/attrchange/ls.attrchange.js",
                "./node_modules/lazysizes/plugins/bgset/ls.bgset.js",
                "./node_modules/lazysizes/plugins/respimg/ls.respimg.js",
                "./node_modules/lazysizes/plugins/parent-fit/ls.parent-fit.js",
                "./node_modules/highlight-select/dist/highlight-select.js",
				src + '/js/base/*.js',
				src + '/js/site/**/*.js'
			],
            watch: [
                src + '/js/base/*.js',
                src + '/js/components/*.vue',
                src + '/js/site/**/*.js'
            ],
			settings: {
				webpackConfig,
				filename: 'tc',
			}
		},

	],

	scssBundles: [

		{
			name: 'main',
			dest: dist + '/styles',
			src: [
				src + '/scss/**/*.scss'
			],
			settings: {
				outputStyle: ':compact',
				errLogToConsole: true,
			}
		}

	],

	svgBundles: [

		{
			name: 'icons',
			dest: dist + '/icons',
			src: [
				src + '/svg/icons/*.svg'
			],
			settings: {
				mode: {
					inline: {
						example: true,
					},
					symbol: {
						example: true,
						dest: ''
					}
					// TODO: Add title/desc meta for accessibility (https://github.com/jkphl/svg-sprite/blob/master/docs/meta-data.md)
				}
			}
		}

	],

	fontBundles: [

		// {
		// 	name: 'main',
		// 	dest: dist + '/fonts',
		// 	src: [
		// 		src + '/fonts/**/*.{ttf,woff,eof,svg}',
		// 	]
		// },

	],

	criticalBundles: [

		// {
		// 	name: 'index',
		// 	url: '',
		// 	template: 'index'
		// },

	],

};
