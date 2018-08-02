const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;
const webp = require('gulp-webp');
const gzip = require('gulp-gzip');

gulp.task('default', ['build'], () => {
  gulp.watch('src/sass/**/*.scss', ['styles']);
  gulp.watch('src/js/**/*.js', ['scripts']);
  gulp.watch('src/**/*.html', ['copy-html']);
  gulp.watch('dist/**/*.html').on('change', browserSync.reload);

  browserSync.init({
    server: './dist',
    cors: true,
  });
  browserSync.stream();
});

gulp.task('build', [
  'images',
  'styles',
  'scripts',
  'copy-files',
  'copy-sw',
  'copy-html',
  'copy-data',
  'compress-js'
]);

gulp.task('styles', () => {
  gulp
    .src('src/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'compressed'
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions']
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('images', () => {
  gulp
    .src('src/img/*')
    .pipe(webp())
    .pipe(gulp.dest('./dist/img/'));
});

gulp.task('scripts', () => {
  gulp
    .src('src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('compress-js', function() {
  gulp.src('./dist/js/*.js')
  .pipe(gzip())
  .pipe(gulp.dest('./dist/js/'));
});

gulp.task('copy-html', () => {
  gulp.src('src/**/*.html').pipe(gulp.dest('./dist/'));
});

gulp.task('copy-files', [
  'copy-manifest',
  'copy-icons-manifest',
  'copy-favicon',
  'copy-browserconfig',
  'copy-svg'
]);

gulp.task('copy-manifest', () => {
  gulp.src('src/manifest.json').pipe(gulp.dest('./dist/'));
});

gulp.task('copy-icons-manifest', () => {
  gulp.src('src/*.png').pipe(gulp.dest('./dist/'));
});

gulp.task('copy-favicon', () => {
  gulp.src('src/*.ico').pipe(gulp.dest('./dist/'));
});

gulp.task('copy-browserconfig', () => {
  gulp.src('src/browserconfig.xml').pipe(gulp.dest('./dist/'));
});

gulp.task('copy-svg', () => {
  gulp.src('src/*.svg').pipe(gulp.dest('./dist/'));
});

gulp.task('copy-sw', () => {
  gulp.src('src/sw.js').pipe(gulp.dest('./dist/'));
});

gulp.task('copy-data', () => {
  gulp.src('src/data/*').pipe(gulp.dest('./dist/data/'));
});
