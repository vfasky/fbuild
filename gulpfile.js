#!/usr/bin/env node

/**
 *
 * @date 2015-03-29 22:35:40
 * @author vfasky <vfasky@gmail.com>
 */

"use strict";

var gulp = require('gulp');
var argv = require('yargs').argv;
var pack = require('./pack');
var hash = require('./hash');
var tpl = require('./tpl');
var uglify = require('gulp-uglify');
var path = require('path');
var FS = require('q-io/fs');
var watch = require('gulp-watch');
var lazypipe = require('lazypipe');

var packTask = function(packPath) {
    console.log('build pack: %s', packPath);
    return gulp.src(packPath)
        .pipe(pack())
        .pipe(gulp.dest(packPath + '/dist'))
        .pipe(uglify())
        .pipe(hash())
        .pipe(gulp.dest(packPath + '/dist'));
};

var tplTask = function(sourePath) {
    console.log('build tpl: %s', sourePath);
    return gulp.src(sourePath)
        .pipe(tpl())
        .pipe(uglify())
        .pipe(hash())
        .pipe(gulp.dest(path.join(sourePath, '../../js/tpl')));
};

gulp.task('pack', function() {
    var packPath = argv.path;
    if (!packPath) {
        throw new Error('path is null');
    }
    packTask(packPath);
});

/**
 * 构建包
 * @example gulp build.pack --path=../rvsui
 *
 * @return {Void}
 */
gulp.task('build.pack', ['pack'], function() {
    var packPath = argv.path;
    if (!packPath) {
        throw new Error('path is null');
    }

    var srcPath = path.join(packPath, 'src/*.js');
    //console.log(srcPath);

    gulp.watch(srcPath, ['pack']);
});

gulp.task('default', function() {
    var sourePath = argv.path;
    if (!sourePath) {
        throw new Error('path is null');
    }

    hash.setPath(sourePath);

    var configPath = path.join(sourePath, 'fbuild.json');

    FS.read(configPath)
        .then(function(json) {
            var config = JSON.parse(json);
            var basePath = sourePath;

            //pack 自动构建
            if (config.pack) {
                var watchPath = path.join(basePath, config.pack, '**/src/*.js');
                watch(watchPath, function(file) {
                    var paths = file.path.split(path.sep);
                    paths.splice(-2, 2);
                    var packPath = paths.join(path.sep);

                    packTask(packPath);
                });
            }
            //tpl 自动构建
            if(config.tpl){
                var watchPath = path.join(basePath, config.tpl, '**/*.html');
                watch(watchPath, function(file) {
                    var paths = file.path.split(path.sep);
                    paths.splice(-1, 1);
                    var sourePath = paths.join(path.sep);

                    tplTask(sourePath);
                });

            }
        })
        .fail(function(err) {
            throw new Error(err);
        });

});
