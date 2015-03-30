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
var uglify = require('gulp-uglify');
var path = require('path');

gulp.task('pack', function(){
    var packPath = argv.path;
    if(!packPath){
        throw new Error('path is null');
    }
    gulp.src(packPath)
        .pipe(pack())
        .pipe(gulp.dest(packPath + '/dist'))
        .pipe(uglify())
        .pipe(hash())
        .pipe(gulp.dest(packPath + '/dist'));
        
});

/**
 * 构建包
 * @example gulp build.pack --path=../rvsui
 *
 * @return {Void}
 */
gulp.task('build.pack', ['pack'], function(){
    var packPath = argv.path;
    if(!packPath){
        throw new Error('path is null');
    }

    var srcPath = path.join(packPath, 'src/*.js');
    //console.log(srcPath);
    
    gulp.watch(srcPath, ['pack']);    
});
