# Karma Unit Test Config
This is a centralized, shared, configuration for Karma based unit testing. You can reference it from your project like so:

# Installation

    npm install --save-dev core-dev-colscott

Create a file called karam-unit.conf.js in the root of the project and copy the following into it:

    module.exports = require('./node_modules/core-dev-colscott/src/lib/karma-unit.conf.js');

# Usage

Add the follow script to the projects package.json file:

    "test:unit": "node ./node_modules/karma/bin/karma start karma-unit.conf.js",

Test files go in ./test/unit folder.

# Running

    npm run test:unit
