/**
 * 将tpl打包成AMD规则的js
 * @date 2015-04-02 22:52:54
 * @author vfasky <vfasky@gmail.com>
 */

"use strict";

var through2 = require('through2');
var FS = require("q-io/fs");
var path = require('path');

module = module.exports = function() {
    return through2.obj(function(file, enc, callback) {
        var srcPath = file.path;

        FS.stat(srcPath).then(function(stat) {
                if (false === stat.isDirectory()) {
                    throw new Error('%s not Dir', srcPath);
                }
                return FS.list(srcPath);
            })
            .then(function(list) {
                var task = [];
                var names = [];
                list.forEach(function(v) {
                    if (v.indexOf('.') === 0) {
                        return false;
                    }
                    if(v.indexOf('.html') !== -1){
                        task.push(FS.read(
                            path.join(srcPath, v)
                        ));
                        names.push(v);
                    }
                });
                task.push(names);

                return task;
            })
            .spread(function() {
                var args = Array.prototype.slice.call(arguments);
                var names = args.pop();
                var paths = file.path.split(path.sep);

                var name = paths.pop();
                if(!name){
                    name = paths.pop();
                }

                var map = {};
                names.forEach(function(v, k){
                    map[v] = args[k];
                });

                var soure = 'define("tpl/'+ name +'", function(){\n'+
                '    "use strict";\n'+
                '    return ' + JSON.stringify(map, null, 4) + ';'+
                '\n});';

                file.contents = new Buffer(soure);
                file.path = path.join(file.path, '../', name + '.js');
                callback(null, file);
            })
            .fail(function(err){
                callback(err, null);
            });

    });
};
