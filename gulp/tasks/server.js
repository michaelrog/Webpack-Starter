import browserSync from 'browser-sync';
import gulp from 'gulp';
import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import { devConfig as webpackConfig } from '../config/webpack.config';


const browser = browserSync.create();
const bundler = webpack(webpackConfig);

export function server() {

    let config = {
        // site: 'main',
        middleware: [
            webpackDevMiddleware(bundler, { /* options */ }),
            // webpackHotMiddleware(bundler, { /* options */ }),
        ],
        proxy: 'tmp.l',

    };

    browser.init(config);

    gulp.watch([
        path.resolve(__dirname, '../../source/**/*'),
        path.resolve(__dirname, '../../public/**/*')
    ]).on('change', () => browser.reload());

}
