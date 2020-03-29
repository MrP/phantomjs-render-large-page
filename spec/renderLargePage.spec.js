/*global expect, jasmine*/
var execSync = require('child_process').execSync;
var resemble = require('node-resemble-js');
var fs = require('fs');

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;
var tmpDir = process.env.TMPDIR || '/tmp';
var tempDir = tmpDir + '/renderLargePage_spec_' + process.pid;
fs.mkdirSync(tempDir);

// Does away with the irritating warning about the fontconfig
process.env.LC_ALL = 'C';

function renderLargePage(page, image, size) {
    size = size || '';
    var command = 'node_modules/phantomjs-prebuilt/bin/phantomjs spec/screenshot.js spec/test-pages/' + page + ' ' + tempDir + '/' + image + ' ' + size;
    execSync(command);
}

function renderLargePageViewportSize(page, image, size) {
    size = size || '';
    var command = 'node_modules/phantomjs-prebuilt/bin/phantomjs spec/screenshotViewportSize.js spec/test-pages/' + page + ' ' + tempDir + '/' + image + ' ' + size;
    execSync(command);
}

function compareImages(generatedImage, existingImage, done) {
    resemble(tempDir + '/' +generatedImage).compareTo('spec/' + existingImage).onComplete(function(data){
    	expect(parseFloat(data.misMatchPercentage) < 0.02).toBe(true);
    	expect(data.isSameDimensions).toBe(true);
    	done();
    });
}

describe('When used on a small image', function () {
    it('should work', function (done) {
        renderLargePage('small.html', 'small.png');
        compareImages('small.png', 'small-test.png', done);
    });
});

describe('When used on a tall image', function () {
    it('should work', function (done) {
        renderLargePage('tall.html', 'tall.png');
        compareImages('tall.png', 'tall-test.png', done);
    });
});

describe('When used on a wide image', function () {
    it('should work', function (done) {
        renderLargePage('wide.html', 'wide.png');
        compareImages('wide.png', 'wide-test.png', done);
    });
});

describe('When used on a wide image changing the viewportSize page property', function () {
    it('should work', function (done) {
        renderLargePageViewportSize('wide.html', 'wide.png');
        compareImages('wide.png', 'wide-test.png', done);
    });
});

describe('When used with a small cell size that will make it have several rows and columns', function () {
    it('should work', function (done) {
        renderLargePage('small.html', 'small.png', 128);
        compareImages('small.png', 'small-test.png', done);
    });
});

