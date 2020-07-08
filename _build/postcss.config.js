const settings = require('./project.settings.js');
const project = require('./project.helpers.js');

/**
 * Custom PurgeCSS extractor for Tailwind that allows special characters in class names.
 *
 * @see https://github.com/FullHuman/purgecss#extractor
 */
class TailwindExtractor {
    static extract(content) {
        return content.match(/[A-Za-z0-9-_:\/]+/g) || [];
    }
}

module.exports = {
    plugins: [
        require('postcss-import')(),
        require("stylelint")({
            "extends": "stylelint-config-recommended",
            "rules": {
                "at-rule-no-unknown": [ true, {
                    "ignoreAtRules": [
                        "screen",
                        "extends",
                        "responsive",
                        "tailwind"
                    ]
                }],
                "block-no-empty": null
            }
        }),
        require('tailwindcss')({
            theme: {
                extend: {
                    colors: {
                        'michael': '#000000',
                    },
                },
            },
            corePlugins: {},
            plugins: [],
        }),
        require('postcss-preset-env')({
            autoprefixer: { grid: true },
            features: {
                'nesting-rules': true
            }
        }),
        require('@fullhuman/postcss-purgecss')({
            content: [
                project.getSourcePath('craft-templates') + '/**/*.{twig,html}',
                project.getSourcePath('vue') + '/**/*.{vue,html}',
                project.getProjectPath('web') + '/*.html',
                project.getProjectPath('web') + '/**/*.html',
            ],
            extractors: [
                {
                    extractor: TailwindExtractor,
                    extensions: settings.purgeCssConfig.extensions
                }
            ],
            whitelist: [],
            whitelistPatterns: [],
        }),
        ...(project.inProduction() ? [require('cssnano')] : []),
    ]
};
