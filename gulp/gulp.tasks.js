// Dependencies

const gulp = require('gulp');

const rename = require('gulp-rename');
const size = require('gulp-size');
const sourcemaps = require('gulp-sourcemaps');

const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const purgecss = require('gulp-purgecss');
const sass = require('gulp-sass');
const tailwindcss = require('tailwindcss');

// Tasks

const scripts = require('./tasks/scripts').scripts;
const server = require('./tasks/server').server;

gulp.task('js-dev', gulp.series( server ));
gulp.task('js-build', gulp.series( scripts ));


/**
 * ======================== styles ========================
 *
 * ...
 *
 */
gulp.task('default', gulp.series(function(done) {
    done();
}));


/*
 * Load config info
 */
//const config = require('./config.js');





/**
 * ======================== test ========================
 *
 * ...
 *
 */
gulp.task('test', gulp.series(function() {

    console.log("Yo.");
    done();

}));


/**
 * ======================== styles ========================
 *
 * ...
 *
 */
gulp.task('styles', function() {

    return gulp.src('source/scss/tc.scss')
        .pipe(size({
            showFiles: true,
            showTotal: false,
            title: "(Source)",
        }))
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(size({
            showFiles: true,
            showTotal: false,
            title: "(SASS'd)",
        }))
        .pipe(postcss([
            tailwindcss(),
            autoprefixer,
            cssnano(),
        ]))
        .pipe(rename({
            suffix: '.min',
        }))
        .pipe(size({
            showFiles: true,
            showTotal: false,
            title: "(Compiled/minified)",
        }))
        .pipe(purgecss({
            content: ['source/craft_templates/**/*.twig'],
            whitelistPatternsChildren: [/theme/, /flickity/, /highlight/, /__/],
        }))
        .pipe(size({
            showFiles: true,
            showTotal: false,
            title: "(Purged)",
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/dist/styles'))
        .pipe(size({
            showTotal: true,
        }));

});
