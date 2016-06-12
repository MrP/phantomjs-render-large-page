# phantomjs-render-large-page
PhantomJS can't render very tall or wide pages (more than 30k pixels).  This library is a workaround to do it anyway.

## Installation
You need imagemagick installed.  In ubuntu, you can install it like this:

    sudo apt-get update
    sudo apt-get install imagemagick

Then

    npm install phantomjs-render-large-page --save

## Usage
Include it like this:

    var renderLargePage = require('phantomjs-render-large-page').renderLargePage;

in you PhantomJS script.

`renderLargePage` is a phantomjs script that expects to be included from inside a phantomjs script, not called directly.

For example: 

    //screenshot.js
    var renderLargePage = require('phantomjs-render-large-page').renderLargePage;
    var page = require('webpage').create();

    page.open('http://example.com', function () {
        renderLargePage(page, 'screenshot.png', function (error) {
            phantom.exit();
        });
    });


## Parameters
The `renderLargePage` function accepts the following parameters:

    renderLargePage(page, filename, callback, [options]);

`page` is the PhantomJS page object to render.

`filename` is a file path where the output image will be rendered, as you would pass it to PhantomJS' `render` function

`callback` is a function that will be called on complete.  callback will be passed an error parameter, that will only be present if there was an error.

`options` is an optional object with the following optional properties:

`options.tmpDir` a path to the directory where renderLargePage will write intermediate files.  Defaults to process.env.TMPDIR (usually /tmp)

`options.format` it will be passed as the second parameter to PhantomJS' `render` function.  Defaults to 'png'

`options.quality` it will be passed as the third parameter to PhantomJS' `render` function.  Defaults to undefined (`render` defaults itself to 75)

`options.limit` Side of the square partial images rendered and stitched together later.  Potentially useful to limit memory use.  Defaults to 30720

For more information on supported image formats, quality, etc, see the PhantomJS docs for the `render` functionality:

http://phantomjs.org/api/webpage/method/render.html
