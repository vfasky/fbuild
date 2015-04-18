#!/usr/bin/env node

/**
 * fbuild bin
 * @date 2015-04-17 10:20:42
 * @author vfasky <vfasky@gmail.com>
 */

'use strict';

var path = require('path');
var spawn = require('child_process').spawn;
var sourePath = process.cwd();
process.env.INIT_CWD = sourePath;

var args = process.argv.slice(2);
var proc;

if(args.length === 0){
    proc = spawn('gulp', ['--path=' + sourePath], {
        cwd: __dirname
    });
}
else{
    switch(args[0].trim()){
        case 'init':
            proc = spawn('gulp', ['init', '--path=' + sourePath], {
                cwd: __dirname
            });
            break;
        case 'init.pack':
            var packName = args[1];
            if(!packName){
                throw new Error('pack name is null');
            }
            var packPath = path.join(sourePath, 'js/pack/', packName);

            proc = spawn('gulp', ['init.pack', '--path=' + packPath], {
                cwd: __dirname
            });
            break;
    }
}

if(proc){
    proc.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    proc.stderr.on('data', function (data) {
        console.log(data.toString());
    });
}
