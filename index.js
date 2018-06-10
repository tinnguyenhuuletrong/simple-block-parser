const Web3 = require('web3');
const net = require('net');
const StorageAdapter = require('./storage')

class SimpleBlockParser {
    constructor({
        scInfo,
        dbPath,
        eventName
    }) {
        this.scInfo = scInfo
        this.dbPath = dbPath
        this.eventName = eventName

        // ready block
        this._ready = new Promise(async (resolve, reject) => {
            try {
                await this._init()                
            } catch (error) {
                throw error
            }
            resolve()
        })
    }

    async _constructSC(scInfo) {
        const { ethLink, address, abi } = scInfo
        const { provider, uri } = ethLink

        let providerIns;
        switch (provider) {
            case 'ws':
                providerIns = new Web3.providers.WebsocketProvider(uri)
                break;
            case 'http':
                providerIns = new Web3.providers.HttpProvider(uri)
                break;
            case 'ipc':
                providerIns = new Web3.provider.IpcProvider(uri)
            default:
                throw new Error('Unknow provider', provider)
                break;
        }

        const web3 = new Web3(providerIns);

        const sc = new web3.eth.Contract(abi, address);
        sc._web3 = web3

        return sc
    }


    async _init() {
        const { scInfo, dbPath, eventName } = this
        const db = await StorageAdapter({ dbPath });
        const sc = await this._constructSC(scInfo);

        const dataCollectionName = `event_${eventName}`
        const metaCollectionName = `meta_${eventName}`

        let dataCollection = db.getOfCreateCollections(dataCollectionName)
        let metaCollection = db.getOfCreateCollections(metaCollectionName)

        this.dataCollection = dataCollection
        this.metaCollection = metaCollection

        const lastSyncBlock = db.findOrCreate(metaCollection, { key: 'lastSyncBlock' }, {
            key: 'lastSyncBlock',
            value: 0
        })

        const doSync = async _ => this._sync({
            dataCollection,
            lastSyncBlock,
            sc,
            eventName
        })

        // initial sync
        await doSync()

        setInterval(_ => {
            doSync()
        }, 2000)
    }

    async _sync({ dataCollection, lastSyncBlock, sc, eventName }) {
        const formBlock = lastSyncBlock.value
        const currentBlockNum = await sc._web3.eth.getBlockNumber()

        if (formBlock < currentBlockNum) {
            const events = await sc.getPastEvents(eventName, {
                fromBlock: lastSyncBlock.value,
                toBlock: currentBlockNum
            })

            // console.log(`sync [${formBlock}] -> [${currentBlockNum}]: ${events.length}`)

            for (const iterator of events) {
                console.log(`[${eventName}] insert ${iterator.blockHash}`)
                dataCollection.insert(iterator)
            }

            lastSyncBlock.value = currentBlockNum + 1
            lastSyncBlock.save()
        }
    }

    async query(filter) {
        await this._ready

        return this.dataCollection.find(filter)
    }

}

module.exports = SimpleBlockParser