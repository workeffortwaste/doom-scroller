const gulp = require('gulp');
const uglifycss = require('gulp-uglifycss');
const terser = require('gulp-terser');
const rename = require('gulp-rename');

gulp.task('minify-css', function () {
    return gulp.src(
        './doom-res/!(*min*)*.css'
    )
        .pipe(uglifycss())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./doom-res/'));
});

gulp.task('minify-js', function () {
    return gulp.src('./doom!(*min*)*.js')
        .pipe(terser({
            compress: true,
            mangle: true
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./'));
});


gulp.task('default',gulp.series('minify-css','minify-js'),function(){});
