/**
 * 
 * @date 2015-04-18 17:41:33
 * @author vfasky <vfasky@gmail.com>
 */

"use strict";

var through2 = require('through2');

module.exports = function(done) {
    return through2.obj(function(file, enc, callback) {
        done(file);
        return callback(null, file);
    });
};
