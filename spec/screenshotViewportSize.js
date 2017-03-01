/*global phantom*/
var page = require('webpage').create();
var renderLargePage = require('../index.js').renderLargePage;
var system = require('system');
var fs = require('fs');

var htmlPage = system.args[1];
var outFile = system.args[2];
var size = system.args.length >= 4 && system.args[3];
var url = 'file://' + fs.absolute(htmlPage);

page.viewportSize = { width:400,height:400 };

page.open(url, function () {
    renderLargePage(page, outFile, function () {
        phantom.exit();
    }, {limit: size});
});
