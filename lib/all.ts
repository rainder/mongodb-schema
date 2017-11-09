import * as mongodb from 'mongodb';
import { CollectionAggregationOptions, Db, ObjectId } from 'mongodb';
import { MongoDBSchemaError } from './lib-error';
import {
  IConditions, IIndexSpec, IModelDecorator, IUpdateOptions, IUpdate, Schema, IPipeline,
  IFindOneAndUpdateOptions
} from './interfaces';
import { getCollection } from './connection';

export { ObjectId };

/**
 *
 */
export class ModelState {
  isNew: boolean;
  lastErrorObject?: any;
  ok?: number;
}

/**
 *
 */
export class ModelProps implements IModelDecorator {
  connection: Promise<Db>;
  collection_name: string;
  indexes: IIndexSpec[];

  constructor(configuration: IModelDecorator) {
    this.collection_name = configuration.collection_name;
    this.indexes = configuration.indexes;
    this.connection = configuration.connection;
  }
}

/**
 *
 */
export type StaticThis<T> = { new (doc: any): T };

/**
 *
 */
export class BaseModel<T> {
  doc: T & Schema;
  state = new ModelState();

  static props: ModelProps;

  constructor(doc: T) {
    this.doc = doc;

    if (doc) {
      this.state.isNew = !this.doc._id;
      this.doc._id = this.doc._id || new ObjectId();
    }
  }

  /**
   *
   * @param {IConditions} conditions
   * @param {IUpdate} update
   * @param {IFindOneAndUpdateOptions} options
   * @returns {Promise<T>}
   */
  static findOneAndUpdate<T>(this: StaticThis<T>, conditions: IConditions, update: IUpdate, options?: IFindOneAndUpdateOptions): Promise<T> {
    const props = <ModelProps>(<any>this).props;
    const collectionName = props.collection_name;

    return getCollection(props.connection, collectionName).then((collection) => {
      return new Promise<T>((resolve, reject) => {
        collection.findOneAndUpdate(conditions, update, options, (err, result) => {
          console.log('>>>', result);
          const record: BaseModel<any> = <any>(result ? new this(result.value) : null);

          if (result) {
            record.state.lastErrorObject = result.lastErrorObject;
            record.state.ok = result.ok;
          }

          err ? reject(err) : resolve(<any>record);
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
  static updateOne(conditions: IConditions, update: IUpdate, options?: IUpdateOptions) {
    const props = <ModelProps>(<any>this).props;
    const collectionName = props.collection_name;

    return getCollection(props.connection, collectionName).then((collection) => {
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
  static updateMany(conditions: IConditions, update: IUpdate, options?: IUpdateOptions) {
    const props = <ModelProps>(<any>this).props;
    const collectionName = props.collection_name;

    return getCollection(props.connection, collectionName).then((collection) => {
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
  static findOne<T>(this: StaticThis<T>, conditions: IConditions): Promise<T> {
    const props = <ModelProps>(<any>this).props;
    const collectionName = props.collection_name;

    return getCollection(props.connection, collectionName).then((collection) => {

      return new Promise<T>((resolve, reject) => {
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
  static findOneOrThrow<T>(this: StaticThis<T>, conditions: IConditions): Promise<T> {
    const props = <ModelProps>(<any>this).props;
    const collectionName = props.collection_name;

    return getCollection(props.connection, collectionName).then((collection) => {
      return new Promise<T>((resolve, reject) => {
        collection.findOne(conditions, (err, result) => {
          if (!result) {
            return reject(MongoDBSchemaError.RECORD_NOT_FOUND({
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
  static remove<T>(this: StaticThis<T>, conditions: IConditions): Promise<T> {
    const props = <ModelProps>(<any>this).props;
    const collectionName = props.collection_name;

    return getCollection(props.connection, collectionName).then((collection) => {
      return new Promise<T>((resolve, reject) => {
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
  static find<T>(this: StaticThis<T>, conditions: IConditions): Promise<mongodb.Cursor> {
    const props = <ModelProps>(<any>this).props;
    const collectionName = props.collection_name;

    return getCollection(props.connection, collectionName).then((collection) => {
      const cursor = collection.find(conditions);

      cursor.map((doc: any) => new this(doc));

      return cursor;
    });
  }

  /**
   *
   * @param {IPipeline[]} pipeline
   * @param {CollectionAggregationOptions} options
   * @returns {Promise<Cursor>}
   */
  static aggregate(pipeline: IPipeline[], options: CollectionAggregationOptions = {}): Promise<mongodb.Cursor> {
    const props = <ModelProps>(<any>this).props;
    const collectionName = props.collection_name;

    return getCollection(props.connection, collectionName).then((collection) => {
      return <any>collection.aggregate(pipeline, options);
    });
  }

  /**
   *
   * @returns {Promise<Collection>}
   */
  save() {
    const props = <ModelProps>(<any>this.constructor).props;
    const collectionName = props.collection_name;

    return getCollection(props.connection, collectionName).then((collection) => {
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
  async update(update: IUpdate, options: any = {}) {
    options.returnOriginal = false;

    const record = await (<any>this.constructor).findOneAndUpdate({
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

/**
 *
 * @param {IModelDecorator} configuration
 * @returns {(target: Function) => any}
 * @constructor
 */
export function Model(configuration: IModelDecorator) {
  return (target: Function) => {
    (<any>target).props = new ModelProps(configuration);

    getCollection(configuration.connection, configuration.collection_name).then((collection) => {
      if (configuration.indexes) {
        collection.createIndexes(configuration.indexes);
      }
    });
  }
}
