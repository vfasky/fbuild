/**
 * 生成配置文件
 * @author vfasky <vfasky@gmail.com>
 */
"use strict";

var through2 = require('through2');
var FS = require("q-io/fs");
var path = require('path');
var hash = require('./hash');
var _ = require('lodash');

module.exports = function(basePath, configFile, config) {
    return through2.obj(function(file, enc, callback) {
        if(!configFile){
            return callback(null, file);
        }

        basePath = path.resolve(basePath);
        configFile = path.resolve(configFile);
        var configDevFile = configFile.replace('.js', '.dev.js');

        var hashFile = hash.getPath();

        FS.read(hashFile)
            .then(function(hashConfig){
                var hashMap = JSON.parse(hashConfig);

                var requireConfig = _.extend({
                    paths: {}
                }, config.requireConfig);

                //dev 配置
                var requireConfigDev = _.extend({
                    paths: {}
                }, config.requireConfig);
           
                var paths = {};
                var devPaths = {};
                //var urlArgs = {};
                var keys = Object.keys(hashMap);

                keys.forEach(function(v){
                    var item = hashMap[v];
                    var pathArr = String(item.path).replace(basePath, '.')
                                                         .split('.');

                    pathArr.pop();
                    paths[v] = pathArr.join('.');
                    
                    if(item.devPath){
                        var devPathArr = String(item.devPath).replace(basePath, '.')
                                                             .split('.');

                        devPathArr.pop();
                        devPaths[v] = devPathArr.join('.');
                    }
                    else{
                        devPaths[v] = paths[v];
                    }
                    //urlArgs[v] = hashMap[v].hash;
                });


                requireConfigDev.paths = _.extend(devPaths, requireConfigDev.paths);
                var configDevStr = 'require.config(' +
                    JSON.stringify(requireConfigDev, null, 4) +
                ');';

                requireConfig.paths = _.extend(paths, requireConfig.paths);

                var configStr = 'require.config(' +
                    JSON.stringify(requireConfig) +
                ');';
                
                return [
                    FS.write(configFile, configStr),
                    FS.write(configDevFile, configDevStr)
                ];

            }).spread(function(){
                callback(null, file);
            });

    });
};
