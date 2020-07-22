const gulp = require('gulp')
const uglifycss = require('gulp-uglifycss')
const terser = require('gulp-terser')
const rename = require('gulp-rename')
const zip = require('gulp-zip')

gulp.task('minify-css', function () {
  return gulp.src(
    './doom-res/!(*min*)*.css'
  )
    .pipe(uglifycss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./doom-res/'))
})

gulp.task('minify-js', function () {
  return gulp.src('./doom!(*min*)*.js')
    .pipe(terser({
      compress: true,
      mangle: true
    }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./'))
})

gulp.task('minify-browser-extension-js', function () {
    return gulp.src('./browser-extension/doom!(*min*)*.js')
        .pipe(terser({
            compress: true,
            mangle: true
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./browser-extension/'))
})

gulp.task('package-web-extension', function () {
  return gulp.src(['./browser-extension/doom-res/*', './browser-extension/webext-res/*', './browser-extension/doom-*.js', './browser-extension/manifest.json'], {
    base: './browser-extension'
  })
    .pipe(zip('doom-scroller-web-extension.zip'))
    .pipe(gulp.dest('dist'))
})

gulp.task('default', gulp.series('minify-browser-extension-js','minify-css', 'minify-js'), function () {})
