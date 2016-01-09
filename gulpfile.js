var gulp = require('gulp');
var concat = require('gulp-concat');
var template = require('gulp-ng-templates');
var rename = require('gulp-rename');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var gulp = require('gulp');
var git = require('gulp-git');
var bump = require('gulp-bump');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');
var minifyHtml = require("gulp-minify-html");

//Build Vars
var finalName = 'sortable.bygiro';

gulp.task('default', ['build']);

// Then save the main provider in the same tmp dir
gulp.task('mkSrc', function() {
  return gulp.src('./src/*.js')
    // .pipe(concat('all.js'))
    .pipe(gulp.dest('./.tmp/'));
});

gulp.task('build', ['mkSrc'], function() {
  return gulp.src('./.tmp/*.js')
    .pipe(ngAnnotate())
    .pipe(concat("jquery."+ finalName + ".js"))
    .pipe(gulp.dest('./dist'))
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('./dist'));
});

function inc(importance) {
  // get all the files to bump version in
  return gulp.src(['./package.json', './bower.json'])
    // bump the version number in those files
    .pipe(bump({
      type: importance
    }))
    // save it back to filesystem
    .pipe(gulp.dest('./'))
    // commit the changed version number
    .pipe(git.commit('bumps package version'))

  // read only one file to get the version number
  .pipe(filter('package.json'))
    // **tag it in the repository**
    .pipe(tag_version());
}

gulp.task('patch', function() {
  return inc('patch');
});
gulp.task('minor', function() {
  return inc('minor');
});
gulp.task('major', function() {
  return inc('major');
});