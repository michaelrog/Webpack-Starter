// Node modules
const _path = require('path');

// Config files
const settings = require('./project.settings.js');

// Webpack project settings exports
// noinspection WebpackConfigHighlighting
module.exports = {

    getProjectPath: (...paths) => {
        return _path.resolve('', ...paths);
    },

    getSourcePath: (...paths) => {
        return _path.resolve(settings.paths.source.base, ...paths);
    },

    getDistPath: (...paths) => {
        return _path.resolve(settings.paths.dist.base, ...paths);
    },

    getMode: () => {
        return (process.env.NODE_ENV === 'production' ? 'production' : 'development');
    },

    inProduction: () => (process.env.NODE_ENV === 'production'),

};
