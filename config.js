"use strict";

var through2 = require('through2');
var FS = require("q-io/fs");
var path = require('path');
var hash = require('./hash');
var _ = require('lodash');

module = module.exports = function(basePath, configFile, config) {
    return through2.obj(function(file, enc, callback) {
        if(!configFile){
            return callback(null, file);
        }

        basePath = path.resolve(basePath);
        configFile = path.resolve(configFile);

        var hashFile = hash.getPath();

        FS.read(hashFile)
            .then(function(hashConfig){
                var hashMap = JSON.parse(hashConfig);

                var requireConfig = config.requireConfig || {};
                requireConfig.paths = requireConfig.paths || {};

                var paths = {};
                //var urlArgs = {};
                var keys = Object.keys(hashMap);

                keys.forEach(function(v){
                    var pathArr = String(hashMap[v].path).replace(basePath, '.')
                                                         .split('.');

                    pathArr.pop();
                    paths[v] = pathArr.join('.');
                    //urlArgs[v] = hashMap[v].hash;
                });

                requireConfig.paths = _.extend(paths, requireConfig.paths);
                //requireConfig.urlArgs = urlArgs;

                var configStr = 'require.config(' +
                    JSON.stringify(requireConfig) +
                ');';

                return FS.write(configFile, configStr);

            }).then(function(){
                callback(null, file);
            });

    });
};
