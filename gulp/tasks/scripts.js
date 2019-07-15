// import path from 'path';s
const webpack = require('webpack');

import { buildConfig as webpackConfig } from '../config/webpack.config';


function scripts() {

    return new Promise(resolve => webpack(webpackConfig, (err, stats) => {
        if (err) console.log('Webpack', err);
        console.log(stats.toString({ /* stats options */ }));
        resolve();
    }))
}

module.exports = { webpackConfig, scripts };
