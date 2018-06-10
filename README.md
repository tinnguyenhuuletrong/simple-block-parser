# SimpleBlockParser

This packaged using for query Smartcontract events. This package using `lokiJs` as cache database and query engine

## Instalation

``` sh
    npm install
```

## Usage

``` javascript
const fs = require('fs');
const SimpleBlockParser = require('simple-block-parser')

const addWhiteList = new SimpleBlockParser({
    scInfo: {
        "ethLink": {
            "provider": "http", // "http|ws|ipc"
            "uri": "...."
        },
        "address": "....",
        "abi" : [
            //....
        ]
    },
    dbPath: '../_tmp/storage.db',
    eventName: 'WhitelistedAddressAdded'
})

// Query using lokiJs
// https://rawgit.com/techfort/LokiJS/master/jsdoc/tutorial-Query%20Examples.html
addWhiteList.query({
    "blockNumber": {
        "$gte": 3390122
    }
})
    .then(console.log)

```