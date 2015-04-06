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

var buildHash = function() {
    return through2.obj(function(file, enc, callback) {
        var newPath = file.path.replace('all.js', 'all.min.js');
        var paths = file.path.split(path.sep);
        var packName = paths.pop().split('.all.')[0];

        if (paths.pop() === 'tpl') {
            packName = 'tpl/' + packName.replace('.js', '');
        }

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
            .then(function() {
                //console.log(file);
                callback(null, file);
            })
            .fail(function(err) {
                callback(err);
            });

    });
};

buildHash.setPath = function(filePath) {
    fileMapPath = path.join(filePath, 'filemap.json');
};

buildHash.getPath = function(){
    return fileMapPath;
};

module = module.exports = buildHash;
