import { Collection, Db, MongoClient, MongoClientOptions } from 'mongodb';

const CONNECTION_COLLECTION_MAP = new WeakMap();

export function createConnection(uri: string, options: MongoClientOptions = {}): Promise<Db> {
  return new Promise<Db>((resolve, reject) => {
    MongoClient.connect(uri, options, (err, db) => {
      err ? reject(err) : resolve(db);
    });
  });
}

export async function getCollection(connectionPromise: Promise<Db>, name: string): Promise<Collection> {
  if (!CONNECTION_COLLECTION_MAP.has(connectionPromise)) {
    CONNECTION_COLLECTION_MAP.set(connectionPromise, {});
  }

  if (CONNECTION_COLLECTION_MAP.get(connectionPromise)[name]) {
    return CONNECTION_COLLECTION_MAP.get(connectionPromise)[name];
  }

  return connectionPromise.then((connection) => {
    return new Promise<Collection>((resolve, reject) => {
      connection.collection(name, (err, collection) => {
        CONNECTION_COLLECTION_MAP.get(connectionPromise)[name] = collection;

        err ? reject(err) : resolve(collection);
      });
    });
  });
}
