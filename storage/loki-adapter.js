const loki = require('lokijs')

var onLoadPromise;


function _extend(db) {

    db.getOfCreateCollections = function (name) {
        var entries = this.getCollection(name);
        if (entries === null) {
            entries = this.addCollection(name);
        }
        return entries
    }

    db.findOrCreate = function (collection, query, defaultVal) {
        let val = collection.findOne(query)
        if (!val) {
            val = collection.insert(defaultVal)
        }

        val.save = function () {
            collection.update(this)
        }
        return val
    }
}

module.exports = function ({
    dbPath = "./loki-storage.db",
    autosaveInterval = 4000
}) {

    if(!onLoadPromise) {
        onLoadPromise = new Promise((resolve, reject) => {
            var db = new loki(dbPath, {
                autoload: true,
                autoloadCallback: databaseInitialize,
                autosave: true,
                autosaveInterval
            });

            // implement the autoloadback referenced in loki constructor
            function databaseInitialize() {
                _extend(db)
                resolve(db)
            }
        })
    }
    
    return onLoadPromise;
}