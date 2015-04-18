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
            var _args = ['init.pack', '--path=' + packPath];
            if(args.length === 3){
                _args.push('--version=' + args[2]);
            }

            proc = spawn('gulp', _args, {
                cwd: __dirname
            });
            break;
        case 'sp': 
        case 'sprite':
            var spArgs = ['build.sprite', '--path=' + sourePath];
            var len = args.length;
            for(var i=1; i<len; i++){
                var v = args[i].trim();
                var val = v.split('=').pop();
                if(val.indexOf('.') === 0){
                    val = path.join(sourePath, val);
                    //console.log(val);
                }
                if(v.indexOf('out=') === 0){
                    spArgs.push('--out=' + val);
                }
                else if(v.indexOf('less=') === 0){
                    spArgs.push('--lessPath=' + val);
                }
            }
            //console.log('gulp ' + spArgs.join(' '));
            proc = spawn('gulp', spArgs, {
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
