"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const CONNECTION_COLLECTION_MAP = new WeakMap();
function createConnection(uri, options = {}) {
    return new Promise((resolve, reject) => {
        mongodb_1.MongoClient.connect(uri, options, (err, db) => {
            err ? reject(err) : resolve(db);
        });
    });
}
exports.createConnection = createConnection;
async function getCollection(connectionPromise, name) {
    if (!CONNECTION_COLLECTION_MAP.has(connectionPromise)) {
        CONNECTION_COLLECTION_MAP.set(connectionPromise, {});
    }
    if (CONNECTION_COLLECTION_MAP.get(connectionPromise)[name]) {
        return CONNECTION_COLLECTION_MAP.get(connectionPromise)[name];
    }
    return connectionPromise.then((connection) => {
        return new Promise((resolve, reject) => {
            connection.collection(name, (err, collection) => {
                CONNECTION_COLLECTION_MAP.get(connectionPromise)[name] = collection;
                err ? reject(err) : resolve(collection);
            });
        });
    });
}
exports.getCollection = getCollection;
//# sourceMappingURL=connection.js.map