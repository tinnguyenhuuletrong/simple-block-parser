const fs = require('fs');
const SimpleBlockParser = require('../')

const addWhiteList = new SimpleBlockParser({
    scInfo: JSON.parse(fs.readFileSync('./pass.json').toString()),
    dbPath: '../_tmp/storage.db',
    eventName: 'WhitelistedAddressAdded'
})

addWhiteList.query({
    "blockNumber": {
        "$gte": 3390122
    }
})
    .then(console.log)

const removeWhiteList = new SimpleBlockParser({
    scInfo: JSON.parse(fs.readFileSync('./pass.json').toString()),
    dbPath: '../_tmp/storage.db',
    eventName: 'WhitelistedAddressRemoved'
})

removeWhiteList.query({
    "blockNumber": {
        "$gte": 3390122
    }
})
    .then(console.log)