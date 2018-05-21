const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('default', () => {
  gulp.watch('src/sass/**/*.scss', ['styles']);
  
  browserSync.init({
    server: "./dist"
  });
  browserSync.stream();
});

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
  pipe.src('src/img/*')
    .pipe(gulp.dest('dist/img/'))
});
