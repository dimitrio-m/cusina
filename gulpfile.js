const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');

gulp.task('default', ['build'], () => {
  gulp.watch('src/sass/**/*.scss', ['styles']);
  gulp.watch('src/js/**/*.js', ['scripts']);
  gulp.watch('src/**/*.html', ['copy-html']);
  gulp.watch('dist/**/*.html').on('change', browserSync.reload);
  
  browserSync.init({
    server: "./dist"
  });
  browserSync.stream();
});

gulp.task('build', ['images', 'styles', 'scripts', 'copy-manifest', 'copy-sw', 'copy-html', 'copy-data']);

gulp.task('styles', () => {
  gulp.src('src/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed',
    }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('images', () => {
  gulp.src('src/img/*')
    .pipe(imagemin({
      progressive: true,
    }))
    .pipe(gulp.dest('./dist/img/'));
});

gulp.task('scripts', () => {
  gulp.src('src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('copy-html', () => {
  gulp.src('src/**/*.html')
    .pipe(gulp.dest('./dist/'));
});

gulp.task('copy-manifest', () => {
  gulp.src('src/manifest.json')
    .pipe(gulp.dest('./dist/'));
});

gulp.task('copy-sw', () => {
  gulp.src('src/sw.js')
  .pipe(gulp.dest('./dist/'));
});

gulp.task('copy-data', () => {
  gulp.src('src/data/*')
  .pipe(gulp.dest('./dist/data/'));
});
