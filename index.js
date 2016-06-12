'use strict';
var fs = require('fs');
var system = require('system');
var spawn = require('child_process').spawn;
var execFile = require('child_process').execFile;
var Promise = require('promise-polyfill');

function findPageDimensions(page) {
    return page.evaluate(function () {
        var body = document.body,
            html = document.documentElement;

        var height = Math.max( body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight );
        var width = Math.max( body.scrollWidth, body.offsetWidth,
            html.clientWidth, html.scrollWidth, html.offsetWidth );

        return {width: width, height: height};
    });
}

function removeMpc(filenameMpc) {
    var filenameCache = filenameMpc.replace(/\.mpc$/i, '.cache');
    fs.remove(filenameMpc);
    fs.remove(filenameCache);
}

function childPromise(command, args) {
    console.log('childPromise', command, args);
    return new Promise(function (resolve, reject) {
        execFile(command, args, null, function (err, stdout, stderr) {
            if (err) {
                console.log(err, JSON.stringify(stderr));
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports.renderLargePage = function (phantomJsPage, filename, callback, options) {
    callback = callback || function () {};
    options = options || {};
    var tmpDir = options.tmpDir || system.env.TMPDIR || '/tmp';
    var format = options.format || 'png';
    var limit = options.limit || 30720;

    var tempDir = tmpDir + '/phantomjs-render-large-page_tmp_' + system.pid;

    if (!fs.makeTree(tempDir)) {
        throw new Error('phantomjs-render-large-page Error couldn\'t create directory ' + tempDir);
    }

    var dimensions = findPageDimensions(phantomJsPage);
    console.log('dimensions', dimensions.height, dimensions.width);

    var filesColumns = [[]],
        filesCells;
    var i,j, name;
    for (i=0; i < dimensions.width; i += limit) {
        filesCells = filesColumns[filesColumns.length-1];
        for (j=0; j < dimensions.height; j += limit) {
            phantomJsPage.clipRect = {
                left: i,
                top: j,
                width: Math.min(limit, dimensions.width - i),
                height: Math.min(limit, dimensions.height - j)
            };
            name = tempDir + '/cell_' + i + '_' + j + '.' + format;
            console.log('rendering', name);
            phantomJsPage.render(name, format, options.quality);
            filesCells.push(name);
        }
        filesColumns.push([]);
    }
    filesColumns.pop();
    
    return Promise.all(filesColumns.map(function (cellFilenames, columnIndex) {
        return Promise.all(cellFilenames.map(function (cellFilename) {
            return childPromise('convert', [cellFilename, cellFilename + '.mpc']).then(function (code) {
                // fs.remove(cellFilename);
                return cellFilename + '.mpc';
            });
        })).then(function (cellFilenamesMpc) {
            var columnFilenameMpc = tempDir + '/column_' + columnIndex + '.mpc';
            return childPromise('convert', cellFilenamesMpc.concat(['-append', columnFilenameMpc])).then(function (code) {
                // cellFilenamesMpc.forEach(removeMpc);
                return columnFilenameMpc;
            });
        });
    })).then(function (columnFilenamesMpc) {
        return childPromise('convert', columnFilenamesMpc.concat(['+append', filename])).then(function (code) {
            // columnFilenamesMpc.forEach(removeMpc);
            fs.removeTree(tempDir);
            callback();
            return filename;
        });
    }).catch(function (error) {
        console.log('There was an error', error);
        callback(error);
    });
};


