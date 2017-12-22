"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
exports.ObjectId = mongodb_1.ObjectId;
const lib_error_1 = require("./lib-error");
const connection_1 = require("./connection");
/**
 *
 */
class ModelState {
}
exports.ModelState = ModelState;
/**
 *
 */
class ModelProps {
    constructor(configuration) {
        this.collection_name = configuration.collection_name;
        this.indexes = configuration.indexes;
        this.connection = configuration.connection;
    }
}
exports.ModelProps = ModelProps;
/**
 *
 */
class BaseModel {
    constructor(doc) {
        this.state = new ModelState();
        this.doc = doc;
        if (doc) {
            this.state.isNew = !this.doc._id;
            this.doc._id = this.doc._id || new mongodb_1.ObjectId();
        }
    }
    /**
     *
     * @param {IConditions} conditions
     * @param {IUpdate} update
     * @param {IFindOneAndUpdateOptions} options
     * @returns {Promise<T>}
     */
    static findOneAndUpdate(conditions, update, options) {
        const props = this.props;
        const collectionName = props.collection_name;
        return connection_1.getCollection(props.connection, collectionName).then((collection) => {
            return new Promise((resolve, reject) => {
                collection.findOneAndUpdate(conditions, update, options, (err, result) => {
                    const record = (result ? new this(result.value) : null);
                    if (result) {
                        record.state.lastErrorObject = result.lastErrorObject;
                        record.state.ok = result.ok;
                    }
                    err ? reject(err) : resolve(record);
                });
            });
        });
    }
    /**
     *
     * @param {IConditions} conditions
     * @param {IUpdate} update
     * @param {IUpdateOptions} options
     * @returns {Promise<any>}
     */
    static updateOne(conditions, update, options) {
        const props = this.props;
        const collectionName = props.collection_name;
        return connection_1.getCollection(props.connection, collectionName).then((collection) => {
            return new Promise((resolve, reject) => {
                collection.updateOne(conditions, update, options, (err, result) => {
                    err ? reject(err) : resolve(result);
                });
            });
        });
    }
    /**
     *
     * @param {IConditions} conditions
     * @param {IUpdate} update
     * @param {IUpdateOptions} options
     * @returns {Promise<any>}
     */
    static updateMany(conditions, update, options) {
        const props = this.props;
        const collectionName = props.collection_name;
        return connection_1.getCollection(props.connection, collectionName).then((collection) => {
            return new Promise((resolve, reject) => {
                collection.updateMany(conditions, update, options, (err, result) => {
                    err ? reject(err) : resolve(result);
                });
            });
        });
    }
    /**
     *
     * @param {IConditions} conditions
     * @returns {Promise<T>}
     */
    static findOne(conditions) {
        const props = this.props;
        const collectionName = props.collection_name;
        return connection_1.getCollection(props.connection, collectionName).then((collection) => {
            return new Promise((resolve, reject) => {
                collection.findOne(conditions, (err, result) => {
                    err ? reject(err) : resolve(result ? new this(result) : null);
                });
            });
        });
    }
    /**
     *
     * @param {IConditions} conditions
     * @returns {Promise<T>}
     */
    static findOneOrThrow(conditions) {
        const props = this.props;
        const collectionName = props.collection_name;
        return connection_1.getCollection(props.connection, collectionName).then((collection) => {
            return new Promise((resolve, reject) => {
                collection.findOne(conditions, (err, result) => {
                    if (!result) {
                        return reject(lib_error_1.MongoDBSchemaError.RECORD_NOT_FOUND({
                            collectionName: collectionName,
                            conditions: conditions,
                        }));
                    }
                    err ? reject(err) : resolve(new this(result));
                });
            });
        });
    }
    /**
     *
     * @param {IConditions} conditions
     * @returns {Promise<T>}
     */
    static remove(conditions) {
        const props = this.props;
        const collectionName = props.collection_name;
        return connection_1.getCollection(props.connection, collectionName).then((collection) => {
            return new Promise((resolve, reject) => {
                collection.deleteMany(conditions, (err, result) => {
                    err ? reject(err) : resolve(new this(result));
                });
            });
        });
    }
    /**
     *
     * @param {IConditions} conditions
     * @returns {Promise<Cursor>}
     */
    static find(conditions) {
        const { connection, collection_name } = this.props;
        return connection_1.getCollection(connection, collection_name).then((collection) => {
            const cursor = collection.find(conditions);
            cursor.map((doc) => new this(doc));
            return cursor;
        });
    }
    /**
     *
     * @param {T} doc
     * @returns {Promise<IInsertOneResult>}
     */
    static insertOne(doc) {
        const { connection, collection_name } = this.props;
        return connection_1.getCollection(connection, collection_name).then((collection) => {
            return collection.insertOne(doc);
        });
    }
    /**
     *
     * @param {T[]} doc
     * @returns {Promise<IInsertManyResult>}
     */
    static insertMany(doc) {
        const { connection, collection_name } = this.props;
        return connection_1.getCollection(connection, collection_name).then((collection) => {
            return collection.insertMany(doc);
        });
    }
    /**
     *
     * @param {IPipeline[]} pipeline
     * @param {CollectionAggregationOptions} options
     * @returns {Promise<Cursor>}
     */
    static aggregate(pipeline, options = {}) {
        const props = this.props;
        const collectionName = props.collection_name;
        return connection_1.getCollection(props.connection, collectionName).then((collection) => {
            return collection.aggregate(pipeline, options);
        });
    }
    /**
     *
     * @returns {Promise<Collection>}
     */
    save() {
        const props = this.constructor.props;
        const collectionName = props.collection_name;
        return connection_1.getCollection(props.connection, collectionName).then((collection) => {
            if (this.state.isNew) {
                return new Promise((resolve, reject) => {
                    collection.insertOne(this.doc, (err, result) => err ? reject(err) : resolve(result));
                }).then((r) => {
                    this.state.isNew = false;
                    return r;
                });
            }
            return new Promise((resolve, reject) => {
                collection.updateOne({
                    _id: this.doc._id,
                }, this.doc, (err, result) => err ? reject(err) : resolve(result));
            });
        });
    }
    /**
     *
     * @param {IUpdate} update
     * @param options
     * @returns {Promise<BaseModel<T>>}
     */
    async update(update, options = {}) {
        options.returnOriginal = false;
        const record = await this.constructor.findOneAndUpdate({
            _id: this.doc._id,
        }, update, options);
        this.doc = record.doc;
        this.state = record.state;
        return this;
    }
    /**
     *
     * @returns {T & Schema}
     */
    toJSON() {
        return this.doc;
    }
}
exports.BaseModel = BaseModel;
/**
 *
 * @param {IModelDecorator} configuration
 * @returns {(target: Function) => any}
 * @constructor
 */
function Model(configuration) {
    return (target) => {
        target.props = new ModelProps(configuration);
        connection_1.getCollection(configuration.connection, configuration.collection_name).then((collection) => {
            if (configuration.indexes) {
                collection.createIndexes(configuration.indexes);
            }
        });
    };
}
exports.Model = Model;
//# sourceMappingURL=all.js.map