
/*
 * ======================== Functions ========================
 */


/**
 * Emits a notification using the OS notifier (via node-notifier)
 *
 * @param message
 */
var emitNotification = function(message)
{
    n.nodeNotifier.notify({
        title: config.name,
        message: message,
        sound: 'Pop'
    })
};


/**
 * Error handler, which will typically be attached via Plumber
 *
 * @see https://gist.github.com/floatdrop/8269868
 *
 * TODO: Use fancylog and chalk to make it pretty!
 *
 * @param err
 */
var handleError = function(err) {
    console.log( 'Plumber error: ' + err );
    emitNotification(err.message);
    this.emit('end');
};


/**
 * Determines the current working path and removes it from the given string
 *
 * @param str
 * @returns {string}
 */
var removeUserPath = function(str)
{
    var userPath = path.dirname(__dirname);
    return str.replace(userPath, '');
};


/**
 * Returns a processing pipe for JS ==> JS assets
 *
 * @param dest
 * @param filename
 * @returns {*}
 */
var jsPipe = function(dest, filename)
{
    return n.lazypipe()
        .pipe(n.plumber, {errorHandler: handleError})
        .pipe(n.newer, dest + '/' + filename + '.min.js')
        // Create concatenated scripts...
        .pipe(n.sourcemaps.init)
        .pipe(n.concat, filename + '.js')
        .pipe(n.sourcemaps.write)
        .pipe(gulp.dest, dest)
        .pipe(n.size, {showFiles: true})
        // ...and then create minified versions
        .pipe(n.sourcemaps.init)
        .pipe(n.uglify)
        .pipe(n.rename, { suffix: '.min' })
        .pipe(n.sourcemaps.write, '.')
        .pipe(gulp.dest, dest)
        .pipe(n.size, {showFiles: true});
};


/**
 * Returns a Webpack processing pipe
 *
 * @param dest
 * @param filename
 * @returns {*}
 */
var webpackPipe = function(dest, settings)
{
    return n.lazypipe()
        .pipe(n.plumber, {errorHandler: handleError})
        .pipe(n.vinylNamed, (f => settings.filename))
        .pipe(n.webpackStream, settings.webpackConfig, n.webpack)
        .pipe(gulp.dest, dest)
        .pipe(n.size, {showFiles: true});
};


/**
 * Returns a processing pipe for SCSS ==> CSS assets
 *
 * TODO: Use cssnano's internal sourcemaps generator? (http://cssnano.co/options/)
 * TODO: Set cssnano's optimizations (http://cssnano.co/optimisations/)
 *
 * @param dest
 * @param settings
 * @returns {*}
 */
var scssPipe = function(dest, settings)
{
    return n.lazypipe()
        .pipe(n.plumber, {errorHandler: handleError})
        // Compile the CSS files...
        .pipe(n.sourcemaps.init)
        .pipe(n.sass, settings)
        .pipe(n.autoprefixer, { browsers: ['last 2 version'] })
        .pipe(n.sourcemaps.write)
        .pipe(gulp.dest, dest)
        .pipe(n.size, {showFiles: true})
        // ...and then create minified versions
        .pipe(n.rename, { suffix: '.min' })
        .pipe(n.sourcemaps.init)
        .pipe(n.cssnano)
        .pipe(n.sourcemaps.write, '.')
        .pipe(gulp.dest, dest)
        .pipe(n.size, {showFiles: true})
};


/**
 * Returns a processing pipe for assembling SVG sprites
 *
 * @param dest
 * @param settings
 * @returns {*}
 */
var svgPipe = function(dest, settings)
{
    return n.lazypipe()
        .pipe(n.plumber, {errorHandler: handleError})
        // Assemble the sprites, yay!
        .pipe(n.svgSprite, settings)
        .pipe(gulp.dest, dest)
        .pipe(n.size, {showFiles: true})
};




/**
 * ======================== listmodules ========================
 *
 * Logs a list of modules that were loaded into the `n` namespace by gulp-load-plugins.
 *
 */
gulp.task('listmodules', function() {

    console.log(n);

});


/**
 * ======================== js ========================
 *
 * ...
 *
 */
gulp.task('js', function() {

    /*
     * We need to return a stream so Gulp can track async things properly.
     * However, we may have multiple file bundles to process.
     * We'll process each bundle in its own stream and return a merged stream to Gulp.
     */
    var streams = [];

    config.jsBundles.forEach( function(bundle) {

        console.log("Processing classic JS bundle...", bundle.name || bundle.settings.filename);

        var stream = gulp.src( bundle.src ).pipe( jsPipe(bundle.dest, bundle.settings.filename)() );
        streams.push(stream);

    } );

    return n.mergeStream(streams);

});




/**
 * ======================== webpack ========================
 *
 * ...
 *
 */
gulp.task('webpack', function() {

    /*
     * We need to return a stream so Gulp can track async things properly.
     * However, we may have multiple file bundles to process.
     * We'll process each bundle in its own stream and return a merged stream to Gulp.
     */
    var streams = [];

    config.webpackBundles.forEach( function(bundle) {

        console.log("Processing Webpack bundle...", bundle.name || bundle.settings.filename);

        var stream = gulp.src( bundle.src ).pipe( webpackPipe(bundle.dest, bundle.settings)() );
        streams.push(stream);

    } );

    return n.mergeStream(streams);

});




/**
 * ======================== scripts ========================
 *
 * ...
 *
 */
gulp.task('scripts', ['js', 'webpack']);




/**
 * ======================== scss ========================
 *
 * ...
 *
 */
gulp.task('scss', function() {

    /*
     * We need to return a stream so Gulp can track async things properly.
     * However, we may have multiple file bundles to process.
     * We'll process each bundle in its own stream and return a merged stream to Gulp.
     */
    var streams = [];

    config.scssBundles.forEach( function(bundle) {

        console.log("Processing SCSS...", bundle.name || bundle.filename);

        var stream = gulp.src( bundle.src ).pipe( scssPipe(bundle.dest, bundle.settings)() );
        streams.push(stream);

    });

    return n.mergeStream(streams);

});




/**
 * ======================== styles ========================
 *
 * ...
 *
 */
gulp.task('styles', ['scss']);




/**
 * ======================== svgs ========================
 *
 * ...
 *
 */
gulp.task('svgs', function() {

    /*
     * We need to return a stream so Gulp can track async things properly.
     * However, we may have multiple file bundles to process.
     * We'll process each bundle in its own stream and return a merged stream to Gulp.
     */
    var streams = [];

    config.svgBundles.forEach( function(bundle) {

        console.log("Processing SVGs...", bundle.name || bundle.filename);

        var stream = gulp.src( bundle.src ).pipe( svgPipe(bundle.dest, bundle.settings)() );
        streams.push(stream);

    });

    return n.mergeStream(streams);

});




/**
 * ======================== images ========================
 *
 * ...
 *
 */
gulp.task('images', ['svgs']);




/**
 * ======================== watch ========================
 *
 * ...
 *
 */
gulp.task('watch', ['images', 'styles', 'scripts'], function() {

    config.webpackBundles.forEach( function(bundle) {
        gulp.watch(bundle.watch, ['webpack']);
    } );

    config.scssBundles.forEach( function(bundle) {
        gulp.watch(bundle.src, ['scss']);
    } );

    config.svgBundles.forEach( function(bundle) {
        gulp.watch(bundle.src, ['svgs']);
    } );

});




/**
 * ======================== serve-bs ========================
 *
 * ...
 *
 */
gulp.task('serve-bs', ['watch'], function() {

    browserSync.init(config.browserSync)

});




/**
 * ======================== serve-lr ========================
 *
 * ...
 *
 */
gulp.task('serve-lr', ['watch'], function() {

    n.livereload.listen();

    gulp.watch(config.livereload.watched, function(event) {

        emitNotification(removeUserPath(event.path) + ' reloaded.');

        gulp.src(event.path)
            .pipe(n.plumber({errorHandler: handleError}))
            .pipe(n.livereload({quiet: false}));

    });

});
