const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

gulp.task('default', ['images', 'styles', 'scripts'], () => {
  gulp.watch('src/sass/**/*.scss', ['styles']);
  gulp.watch('src/js/**/*.js', ['scripts']);
  
  browserSync.init({
    server: "./dist"
  });
  browserSync.stream();
});

gulp.task('build', ['images', 'styles', 'scripts']);

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
    .pipe(gulp.dest('./dist/img/'));
});

gulp.task('scripts', () => {
  gulp.src('src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/js/'));
});
