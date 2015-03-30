/**
 *
 * @date 2015-03-30 00:12:45
 * @author vfasky <vfasky@gmail.com>
 */

"use strict";

var through2 = require('through2');
var FS = require("q-io/fs");
var path = require('path');
var crypto = require('crypto');

var md5 = function(text) {
    return crypto.createHash('md5').update(String(text)).digest('hex');
};

var getHash = function(text) {
    return md5(text).substring(0, 6);
};

var fileMapPath = path.join(__dirname, 'filemap.json');

module = module.exports = function() {
    return through2.obj(function(file, enc, callback) {
        var newPath = file.path.replace('all.js', 'all.min.js');
        var packName = file.path.split(path.sep).pop().split('.all.')[0];

        file.path = newPath;
        var hash = getHash(file.contents);

        FS.exists(fileMapPath).then(function(stat) {
                if (stat) {
                    return FS.read(fileMapPath);
                }
                return '{}';
            })
            .then(function(json) {
                var data = JSON.parse(json);

                data[packName] = {
                    hash: hash,
                    path: file.path
                };

                return FS.write(fileMapPath, JSON.stringify(data, null, 4));
            })
            .then(function(){
                //console.log(file);
                callback(null, file);
            })
            .fail(function(err) {
                callback(err);
            });

    });
};
