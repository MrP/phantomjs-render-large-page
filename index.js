'use strict';
var fs = require('fs');
var system = require('system');
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

function childPromise(command, args) {
    return new Promise(function (resolve, reject) {
        execFile(command, args, null, function (err, stdout, stderr) {
            if (err) {
                reject(err + JSON.stringify(stderr));
            } else {
                resolve();
            }
        });
    });
}

var figureOutImageMagickExecutable = childPromise('magick', [])
    .then(function() { return 'magick'; })
    .catch(function() { return childPromise('convert', []); })
    .then(function() { return 'convert'; })
    .catch(function() { return childPromise('magick.exe', []); })
    .then(function() { return 'magick.exe'; });

module.exports.renderLargePage = function (phantomJsPage, filename, callback, options) {
    callback = callback || function () {};
    options = options || {};
    var tmpDir = options.tmpDir || system.env.TMPDIR || '/tmp';
    var format = options.format || 'png';
    var limit = 30720;
    var quality = options.quality || 100;
    var parsedOptionsLimit = parseInt(options.limit, 10);
    if (options.limit && !isNaN(parsedOptionsLimit)) {
        limit = parsedOptionsLimit;
    }

    var tempDir = tmpDir + '/phantomjs-render-large-page_tmp_' + system.pid;

    if (!fs.makeTree(tempDir)) {
        throw new Error('phantomjs-render-large-page Error couldn\'t create directory ' + tempDir);
    }

    var dimensions = findPageDimensions(phantomJsPage);

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
            phantomJsPage.render(name, format, quality);
            filesCells.push(name);
        }
        filesColumns.push([]);
    }
    filesColumns.pop();
    
    return figureOutImageMagickExecutable.then(function (imageMagickExecutable) {
        return Promise.all(filesColumns.map(function (cellFilenames, columnIndex) {
            return Promise.all(cellFilenames.map(function (cellFilename) {
                return childPromise(imageMagickExecutable, [cellFilename, cellFilename + '.mpc']).then(function (code) {
                    return cellFilename + '.mpc';
                });
            })).then(function (cellFilenamesMpc) {
                var columnFilenameMpc = tempDir + '/column_' + columnIndex + '.mpc';
                return childPromise(imageMagickExecutable, cellFilenamesMpc.concat(['-append', columnFilenameMpc])).then(function (code) {
                    return columnFilenameMpc;
                });
            });
        })).then(function (columnFilenamesMpc) {
            return childPromise(imageMagickExecutable, columnFilenamesMpc.concat(['-quality', '' + quality, '+append', filename])).then(function (code) {
                fs.removeTree(tempDir);
                callback();
                return filename;
            });
        })    
    })
    .catch(function (error) {
        callback(error);
    });
};


