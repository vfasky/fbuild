#!/usr/bin/env node

/**
 *
 * @date 2015-03-29 22:35:40
 * @author vfasky <vfasky@gmail.com>
 */

"use strict";

var gulp = require('gulp');
var argv = require('yargs').argv;
var buildPack = require('./pack');
var buildHash = require('./hash');
var buildTpl = require('./tpl');
var buildConfig = require('./config');
var rename = require('./rename');
var uglify = require('gulp-uglify');
var path = require('path');
var FS = require('q-io/fs');
var watch = require('gulp-watch');
var less = require('gulp-less');
var spritesmith = require('gulp.spritesmith');

/**
 * 构建less
 * @param {String} sourePath 源目录
 * @param {String} distPath  输出目录
 */
var lessTask = function(sourePath, distPath) {
    console.log('build less: %s', sourePath);

    return gulp.src(sourePath)
        .pipe(less({
            compress: true
        }))
        .pipe(gulp.dest(distPath || '../css'));
};


/**
 * 构建pack
 * @param {String} packPath 目录
 */
var packTask = function(packPath, packVersion) {

    console.log('build pack: %s', packPath);
    return gulp.src(packPath)
        .pipe(buildPack())
        .pipe(gulp.dest(packPath + '/dist'))
        .pipe(uglify())
        .pipe(rename(function(filePath) {
            return filePath.replace('all.js', 'all.min.js');
        }))
        .pipe(buildHash(packVersion))
        .pipe(gulp.dest(packPath + '/dist'));
};

/**
 * 构建模板
 * @param {String} sourePath 模板目录
 */
var tplTask = function(sourePath) {

    console.log('build tpl: %s', sourePath);
    return gulp.src(sourePath)
        .pipe(buildTpl())
        .pipe(uglify())
        .pipe(rename(function(filePath) {
            var paths = filePath.split(path.sep);
            var name = paths.pop();
            var newPath = path.join(
                paths.join(path.sep),
                '../js/tpl',
                name
            );
            //console.log(newPath);
            return newPath;
        }))
        .pipe(buildHash())
        .pipe(gulp.dest(path.join(sourePath, '../../tpl')));
};

/**
 * 生成雪碧图
 * @param {String} sourePath 监听的目录
 * @param {String=../sprite} outPath  图片输出目录
 * @param {String=../less} lessPath  less 输出目录
 */
var spriteTask = function(sourePath, outPath, lessPath) {
    console.log('build sprite: %s', sourePath);

    var time = (new Date()).getTime();

    sourePath = path.normalize(sourePath);

    outPath = outPath ? path.normalize(outPath) : path.join(sourePath, '../sprite');
    lessPath = lessPath ? path.normalize(lessPath) : path.join(sourePath, '../less');

    var imgPath = path.relative(lessPath, outPath);

    var paths = sourePath.split(path.sep);

    var name = paths.pop();
    if (!name) {
        name = paths.pop();
    }

    var option = {
        imgName: name + ".png",
        cssName: "_sp_" + name + ".less",
        imgPath: imgPath + '/' + name + ".png?" + time,
        cssFormat: 'css',
        algorithm: 'binary-tree',
        cssOpts: {
            cssSelector: function(item) {
                return ".sp-" + name + "-" + item.name;
            }
        }
    };

    var pngPath = path.join(sourePath, '*.png');


    var spriteData = gulp.src(pngPath)
        .pipe(spritesmith(option));

    //console.log(outPath);

    spriteData.img.pipe(
        gulp.dest(outPath)
    );

    spriteData.css.pipe(
        gulp.dest(lessPath)
    );

};

gulp.task('_pack', function() {
    var packPath = argv.path;
    if (!packPath) {
        throw new Error('path is null');
    }
    packTask(packPath);
});

/**
 * 生成雪碧图
 * @example gulp build.sprite --path=/Users/vfasky/test/src --lessPath=/Users/vfasky/test/less
 * @return {Void}
 */
gulp.task('build.sprite', function(){
    var sourePath = argv.path;
    if (!sourePath) {
        throw new Error('path is null');
    }

    var outPath = argv.out || null;
    var lessPath = argv.lessPath || null;
    var watchPath = path.join(sourePath, '*.png');

    watch(watchPath, function(file) {
        var paths = file.path.split(path.sep);
        paths.splice(-1, 1);
        var sourePath = paths.join(path.sep);

        spriteTask(sourePath, outPath, lessPath);
    });
});

/**
 * 构建包
 * @example gulp build.pack --path=../rvsui
 *
 * @return {Void}
 */
gulp.task('build.pack', ['_pack'], function() {
    var packPath = argv.path;
    if (!packPath) {
        throw new Error('path is null');
    }

    var srcPath = path.join(packPath, 'src/*.js');
    //console.log(srcPath);

    gulp.watch(srcPath, ['pack']);
});

/**
 * 初始化包目录
 * @example gulp init.pack --path=../static/js/pack/test
 */
gulp.task('init.pack', function() {
    var packPath = argv.path;
    if (!packPath) {
        throw new Error('path is null');
    }

    var version = argv.version || '1.0.0';

    FS.makeTree(path.join(packPath, version, 'src'))
        .then(function() {
            return FS.makeTree(path.join(packPath, version, 'dist'));
        })
        .then(function() {
            return FS.makeTree(path.join(packPath, version, 'test'));
        })
        .then(function() {
            var paths = packPath.split(path.sep);
            var name = paths.pop();
            if (!name) {
                name = paths.pop();
            }
            return FS.write(
                path.join(packPath, version, 'src/index.js'),
                'define(\'' + name + '\', [], function(){ \n' +
                '    return {};\n' +
                '});'
            );
        });
});


/**
 * 初始化目录
 * @example gulp init --path=../static
 */
gulp.task('init', function() {
    var sourePath = argv.path;
    if (!sourePath) {
        throw new Error('path is null');
    }

    FS.makeTree(path.join(sourePath, 'js/pack'))
        .then(function() {
            return FS.makeTree(path.join(sourePath, 'js/tpl'));
        })
        .then(function() {
            return FS.makeTree(path.join(sourePath, 'tpl'));
        })
        .then(function() {
            return FS.makeTree(path.join(sourePath, 'style/less'));
        })
        .then(function() {
            return FS.makeTree(path.join(sourePath, 'style/css'));
        })
        .then(function() {
            return FS.makeTree(path.join(sourePath, 'style/sprite_src'));
        })
        .then(function() {
            return FS.makeTree(path.join(sourePath, 'style/sprite'));
        })
        .then(function() {
            return FS.copy(
                path.join(__dirname, 'fbuild_tpl.json'),
                path.join(sourePath, 'fbuild.json')
            );
        });
});

/**
 * 执行自动化工具
 * - 自动构建包
 * - 自动生成模板
 * - 自动编译less
 * @example gulp --path=../static
 * @return {Void}
 */
gulp.task('default', function() {
    var sourePath = argv.path;
    if (!sourePath) {
        throw new Error('path is null');
    }

    var configFile = argv.config || path.join(sourePath, 'js/config.js');

    buildHash.setPath(sourePath);

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

                    packTask(packPath, config.packVersion).pipe(
                        buildConfig(basePath, configFile, config)
                    );
                });
            }
            //tpl 自动构建
            if (config.tpl) {
                var watchPath = path.join(basePath, config.tpl, '**/*.html');
                watch(watchPath, function(file) {
                    var paths = file.path.split(path.sep);
                    paths.splice(-1, 1);
                    var sourePath = paths.join(path.sep);

                    tplTask(sourePath).pipe(
                        buildConfig(basePath, configFile, config)
                    );
                });

            }
            //less 自动构建
            if (config.less) {
                var watchPath = path.join(basePath, config.less, '**/*.less');

                watch(watchPath, function(file) {
                    var paths = file.path.split(path.sep);

                    var distPath = path.join(basePath, config.less, '../css');
                    var name = paths[paths.length - 2];
                    if (paths[paths.length - 1].indexOf('_') === 0) {
                        return;
                    }
                    if (name !== config.less.split(path.sep).pop()) {
                        distPath = path.join(distPath, name);
                    }

                    lessTask(file.path, distPath);
                });
            }
            //sprite 自动构建
            if(config.sprite){
                var watchPath = path.join(basePath, config.sprite, '**/*.png');
                var spriteImg = null;
                var spriteLess = null;
                if(config.spriteImg){
                    spriteImg = path.join(basePath, config.spriteImg);
                }
                if(config.spriteLess){
                    spriteLess = path.join(basePath, config.spriteLess);
                }

                watch(watchPath, function(file){
                    var paths = file.path.split(path.sep);
                    paths.splice(-1, 1);
                    var sourePath = paths.join(path.sep);

                    spriteTask(sourePath, spriteImg, spriteLess);
                });
            }
        })
        .fail(function(err) {
            throw new Error(err);
        });

});
