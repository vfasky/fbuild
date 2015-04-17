/**
 *
 * @date 2015-03-29 23:07:10
 * @author vfasky <vfasky@gmail.com>
 */

"use strict";

var through2 = require('through2');
var FS = require("q-io/fs");
var path = require('path');

module.exports = function() {
    return through2.obj(function(file, enc, callback) {
        var srcPath = path.join(file.path, 'src');

        FS.stat(srcPath).then(function(stat) {
                if (false === stat.isDirectory()) {
                    throw new Error('%s not Dir', srcPath);
                }
                return FS.list(srcPath);
            })
            .then(function(list) {
                var hasIndex = false;
                var task = [];
                list.forEach(function(v) {
                    if (v.indexOf('.') === 0) {
                        return false;
                    }
                    if (v === 'index.js') {
                        hasIndex = true;
                        return false;
                    }
                    if(v.indexOf('.js') !== -1){
                        task.push(FS.read(
                            path.join(srcPath, v)
                        ));
                    }
                });
                if (hasIndex) {
                    task.push(FS.read(
                        path.join(srcPath, 'index.js')
                    ));
                }

                return task;
            })
            .spread(function() {
                var args = Array.prototype.slice.call(arguments);
                var soure = args.join('\n;\n');
                var paths = file.path.split(path.sep);

                var name = paths.pop();
                if(!name){
                    name = paths.pop();
                }

                file.contents = new Buffer(soure);
                file.path = path.join(file.path, '../', name + '.all.js');
                callback(null, file);
            })
            .fail(function(err){
                callback(err, null);
            });
    });
};


