/* global describe, beforeAll, afterAll, beforeEach, afterEach, it, expect */
/*
 * This file is not written using ES6 modules. This file is run in a Node.js environment not a browser.
 */
/**
 * This suite of tests performs integration smoke tests.
 * It does this by navigating to each page listed in the pages Array in the code below.
 * To add more routes append them to the routes variable.
 * 
 * @param {Object} config - test configuration
 * @param {string[]} config.routes - pages and routes to test e.g. ['demo/index.html', 'app/employee/34/details', etc.]
 * @param {Object[]} config.screenFormats - the different size vieports to run against
 * @param {string} config.screenFormats[].name - the name to give to the screen format. will be used in generated file names
 * @param {number} config.screenFormats[].width - the width of the viewport
 * @param {number} config.screenFormats[].name - the height of the viewport
 * @param {string[]} config.browsers - the browsers to test in ['chrome', 'firefox', 'edge']
 * @param {string} config.appUrl - the base url to use that will be prefixed before each route. This should contain the domain name e.globalThis. http://localhost:4444
 */
module.exports = function(config) {
    /* List of routes to smoke test with screen shot comparisons */
    const routes = config.routes;

    /**
     * Lists the different screen size formats that are tested for each page.
     * - name - identifies this screen format size. A folder will be created with this name and used to store baseline screen shots.
     * - width - the width in pixels of the viewport
     * - height - the height in pixels of the view port
     */
    const screenFormats = config.screenFormats || [
        {
            name: 'wide',
            width: 800,
            height: 600,
        },
        {
            name: 'narrow',
            width: 375,
            height: 667,
        },
    ];

    // TODO move to CoreLib
    /** This feature has not been implemented yet. In the future it will allow control over which browsers to support */
    const browsers = config.browsers || ['chrome'];

    /* Only change this line if you have an issue with port 4444 */
    const appUrl = config.appUrl || 'http://127.0.0.1:4444/';

    const puppeteer = require('puppeteer');
    const pixelMatch = require('pixelmatch');
    const express = require('express');
    const path = require('path');
    const fs = require('fs');
    // eslint-disable-next-line prefer-destructuring
    const PNG = require('pngjs').PNG;

    const currentDir = `${process.cwd()}/test/integration/screenshots-current`;
    const baselineDir = `${process.cwd()}/test/integration/screenshots-baseline`;

    describe('routing tests', () => {
        let browserInstance;
        let page;
        let originalTimeout;

        beforeAll(() => {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

            startServer();

            // Create the test directory if needed.
            if (!fs.existsSync(currentDir)) {
                fs.mkdirSync(currentDir);
            }
            if (!fs.existsSync(baselineDir)) {
                fs.mkdirSync(baselineDir);
            }
            // // And it's subdirectories.
            // for (let j = 0, jlen = screenFormats.length; j < jlen; j++) {
            //     if (!fs.existsSync(`${currentDir}/${screenFormats[j].name}`)) {
            //         fs.mkdirSync(`${currentDir}/${screenFormats[j].name}`);
            //     }
            //     if (!fs.existsSync(`${baselineDir}/${screenFormats[j].name}`)) {
            //         fs.mkdirSync(`${baselineDir}/${screenFormats[j].name}`);
            //     }
            // }
        });

        afterAll(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
            stopServer();
        });

        beforeEach(async () => {
            browserInstance = await puppeteer.launch();
            page = await browserInstance.newPage();
        });

        afterEach(() => browserInstance.close());

        /**
         * Smoke test helper for executing smoke test against one page
         * @param {string} route url of the route to test. See the routes variable for list of routes to be tested.
         * @param {any} screenFormat the screen height and width to test
         * @param {string} browser the browser currently being used
         */
        async function smokeTestPage(route, screenFormat, browser) {
            const url = `${appUrl}${route}`;
            console.info(`Smoke testing page ${url}`);
            console.info(`Compare screen shots for ${url}`);
            await takeAndCompareScreenshot(page, route, screenFormat, browser);
        }

        /**
         * Runs the tests. Tests are run for all pages in all screen formats.
         */
        for (let k = 0, kLen = browsers.length; k < kLen; k++) {
            const browser = browsers[k];
            for (let j = 0, jlen = screenFormats.length; j < jlen; j++) {
                const screenFormat = screenFormats[j];
                for (let i = 0, iLen = routes.length; i < iLen; i++) {
                    const route = routes[i];
                    it('smoke test page', smokeTestPage.bind(this, route, screenFormat, browser));
                }
            }
        }
    });

    const app = express();
    let server;
    /** Starts the integration server */
    function startServer() {
        app.use(express.static(path.join(__dirname, '../../../../../')));

        server = app.listen(4444);
    }

    /** Stops the integration server */
    function stopServer() {
        if (server) {
            server.close();
        }
    }

    /**
     * Takes a screen shot of the current screen and compares it with the baseline screen shot.
     * If no baseline screen shot exists then one is created using the current screen shot.
     * @param {*} page
     * @param {*} route
     * @param {*} screenFormat
     */
    async function takeAndCompareScreenshot(page, route, screenFormat, browser) {
        // If you didn't specify a file, use the name of the route.
        const fileName = `${browser}_${screenFormat.name}_${(route ? route : 'index').replace(/[\/\\]/g, '_')}`;
        await page.setViewport({ width: screenFormat.width, height: screenFormat.height });
        await page.goto(`http://127.0.0.1:4444/${route}`);
        console.info(`Taking screen shot ${fileName} ${currentDir}/${fileName}.png`);
        await page.screenshot({ path: `${currentDir}/${fileName}.png` });
        if (fs.existsSync(`${baselineDir}/${fileName}.png`) === false) {
            console.info(`Baseline screen shot does not exist. Generating ${fileName} ${currentDir}/${fileName}.png`);
            await page.screenshot({ path: `${baselineDir}/${fileName}.png` });
        }
        return compareScreenshots(fileName);
    }

    /**
     * Takes one screen shot and compares with another for differences
     * @param {*} view
     */
    function compareScreenshots(view) {
        return new Promise((resolve, reject) => {
            // Note: for debugging, you can dump the screenshotted img as base64.
            // fs.createReadStream(`${currentDir}/${view}.png`, { encoding: 'base64' })
            //   .on('data', function (data) {
            //     console.log('got data', data)
            //   })
            //   .on('end', function () {
            //     console.log('\n\n')
            //   });
            const img1 = fs
                .createReadStream(`${currentDir}/${view}.png`)
                .pipe(new PNG())
                .on('parsed', doneReading);
            const img2 = fs
                .createReadStream(`${baselineDir}/${view}.png`)
                .pipe(new PNG())
                .on('parsed', doneReading);

            let filesRead = 0;
            /**
             * 
             */
            function doneReading() {
                // Wait until both files are read.
                // eslint-disable-next-line no-plusplus
                if (++filesRead < 2) return;

                // The files should be the same size.
                expect(img1.height, 'image heights are the same').toEqual(img2.height);
                expect(img1.width, 'image widths are the same').toEqual(img2.width);

                // Do the visual diff.
                const diff = new PNG({ width: img1.width, height: img1.height });

                // Skip the bottom/rightmost row of pixels, since it seems to be
                // noise on some machines :/
                const width = img1.width - 1;
                const height = img1.height - 1;

                const numDiffPixels = pixelMatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.2 });
                const percentDiff = numDiffPixels / (width * height) * 100;

                const stats = fs.statSync(`${currentDir}/${view}.png`);
                const fileSizeInBytes = stats.size;
                console.info(`ðŸ“¸ ${view}.png => ${fileSizeInBytes} bytes, ${percentDiff}% different`);

                // diff.pack().pipe(fs.createWriteStream(`${currentDir}/${view}-diff.png`));
                expect(numDiffPixels, 'number of different pixels').toEqual(0);
                resolve();
            }
        });
    }
}