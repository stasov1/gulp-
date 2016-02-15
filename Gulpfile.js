"use strict";

// функция для обработки ошибок в потоке
function swallowError (error) {

  // If you want details of the error in the console
  console.log(error.toString());

  this.emit('end');
}

var gulp = require("gulp"),
    rename = require("gulp-rename"),
    less = require("gulp-less"),
    lessImport = require("gulp-less-import"),
    replace = require("gulp-replace-task"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    csscomb = require("gulp-csscomb"),
    csso = require("gulp-csso"),
    cleanDest = require("gulp-clean-dest"),
    autoprefixer = require("gulp-autoprefixer");

gulp.task("style", function(done) {
  return gulp.src([
    "assets/less/utils/vars.less",
    "assets/less/utils/mixins.less",
    "assets/less/utils/extends.less",
    "assets/less/utils/fonts.less",
    "assets/less/vendor/**/*.less",
    "assets/less/blocks/**/*.less"
    ])
    .pipe(lessImport("app.less"))
    .pipe(replace({
      patterns: [
        {
          match: /assets\\less\\/g,
          replacement: ""
        }
      ]
    }))
    .pipe(replace({
      patterns: [
        {
          match: /\\/g,
          replacement: "/"
        }
      ]
    }))
    .pipe(gulp.dest("assets/less/"))
    .pipe(less().on("error", swallowError))  // обработка ошибок
    .pipe(autoprefixer({
        browsers: ["last 5 versions"],
        cascade: false
      }))
    .pipe(rename("style.css"))
    .pipe(gulp.dest("assets/"));
});

gulp.task("default", function() {
  gulp.watch([
    "assets/less/**/*.less",
    "!assets/less/app.less"
  ], ["style"]);

  gulp.watch([
      "assets/js/**/*.js",
      "!assets/js/app.js",
      "!assets/js/app.min.js"
    ], ["scripts"]);

  gulp.watch("assets/*.html", ["html"]);
});

gulp.task("scripts", function() {
  return gulp.src([
    "assets/js/libs/**/*.js",
    "assets/js/*.js",
    "!assets/js/app.js",
    "!assets/js/app.min.js"
    ])
  .pipe(concat("app.js"))
  .pipe(gulp.dest("assets/js"))
  .pipe(uglify().on("error", swallowError))
  .pipe(rename("app.min.js"))
  .pipe(gulp.dest("assets/js"));
});

// Сборка в продакшн
gulp.task("comb_style", ["clean", "style"], function() {
  gulp.src("assets/style.css")
    .pipe(csscomb())
    .pipe(gulp.dest("app/"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("app/"));
});

gulp.task("clean", function() {
  return gulp.src("app/**/*")
    .pipe(cleanDest("app"));
});

gulp.task("copy", ["clean", "scripts"], function() {
  gulp.src("assets/fonts/**/*")
    .pipe(gulp.dest("app/fonts"));
  gulp.src("assets/img/**/*")
    .pipe(gulp.dest("app/img"));
  gulp.src(["assets/js/app.js", "assets/js/app.min.js"])
    .pipe(gulp.dest("app/js/"));
  gulp.src(["assets/**/*.css", "!assets/style.css"])
    .pipe(gulp.dest("app/"));
  return gulp.src("assets/*.html")
    .pipe(gulp.dest("app/"));
});

gulp.task("prod", function() {
  gulp.start([
    "style",
    "scripts",
    "clean",
    "comb_style",
    "copy"
  ]);
});