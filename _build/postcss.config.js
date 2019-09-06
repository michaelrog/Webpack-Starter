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
        require('tailwindcss')('./_build/tailwind.config.js'),
        require('postcss-preset-env')({
            autoprefixer: { grid: true },
            features: {
                'nesting-rules': true
            }
        })
    ]
};
