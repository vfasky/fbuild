"use strict";

var through2 = require('through2');

module.exports = function(fun) {
    return through2.obj(function(file, enc, callback) {
        file.path = fun(file.path);
        callback(null, file);
    });
};
