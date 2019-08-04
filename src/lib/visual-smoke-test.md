# Visual smoke test
This test suite tool is designed to give quick feedback on the health of pages and routes in the app.
This is done by generating screen shots for given route, browser, screen format combinations and test the resulting screen shots against a baseline.
Using Jasmine, the comparison is done via an assert that fails if the screen shots do not match.

# Installation

    npm install --save-dev dev-lib-colscott

Make sure you have the folloiwng peerDependencies installed as devDependencies:

    npm install --save-dev express jasmine pixelmatch puppeteer

Add the following script to your package.json:

    "test:integration": "node ./node_modules/jasmine/bin/jasmine \"test/integration/**/*.js\""

# Usage
## Create a test file
Create a `test/integration/visual-smoke-test.js` file and populate it with the code below.

## Simple using defaults

    const visualSmokeTest = require('dev-lib-colscott/src/lib/visual-smoke-test');

    visualSmokeTest({
        routes: ['demo/index.html'],
    });

## Version showing all options

    const visualSmokeTest = require('dev-lib-colscott/src/lib/visual-smoke-test');

    visualSmokeTest({
        routes: ['demo/index.html'],
        browsers: ['chrome'],
        screenFormats: [
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
        ],
        appUrl: 'http://127.0.0.1:4444/',
    });

# Running

    npm run test:integration

# Configuration
There are 4 parts to configuration:

## Routes to test (required)
In visual-smoke-test.js there is a routes variable that is an Array of route url strings to run the smoke tests against. Each page/route to be tested should have an entry in this list. Include full route including any route parameters. e.g.

    const routes = [
        'app',
        'app/login',
        'app/employee/34/details',
    ];

## Application base URL (optional)
This is the prefix that is added to all routes defined. It should be something like: `'http://127.0.0.1:4444/'`

The default value is `'http://127.0.0.1:4444/'`.

## Browsers to test (optional)
This is currently a placeholder for future support of multiple browsers. At the moment only Chrome is supported.
In visual-smoke-test.js there is a browsers variable that is an Array of browser strings to run the smoke tests against. More browsers can be added to this list. Availbale browsers are: 'chrome'.

The default value is `['chrome']`. More browsers will be added to the default as time goes on.

## Screen formats to test (optional)
To test that the application looks correct in different screen sizes, the tests can be run across multiple browser viewport sizes. The viewport sizes to e tested are configured in the screenFormats variable.

The deafult value is:

    [
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
    ]

# Generating baseline screen shots
There are occasions when a baseline screen shot will not exist (the first time the tests are run, new routes, etc.). If the test does not detect a baseline for any screen shot, one is created and te test passes.

Committing to a repository:
 - Baseline screen shots should be committed to the repository.
 - Current screen shots should NOT be committed to the repository. test/integration/screenshots-current should be added to the repository ignore list.
 - Before committing screen shot, double check that the screen shots look correct.

# Generating new baseline screen shots after a UI change
The UI often changes. UI changes will break the smoke tests. To fix this, delete the offending baseline screen shots from the test/integration/screenshots-baseline folder and rerun the tests to generate new screen shots. 

Remember to check the screen shots after they have been generated.

Also, you can simply delete the test/integration/screenshots-baseline folder and rerun the smoke tests. During the repository commit process, make sure that only the screen shots you expect to have changed appear for commit.