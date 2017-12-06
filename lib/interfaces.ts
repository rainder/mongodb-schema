import { Db } from 'mongodb';
import { ObjectId } from './all';

export interface IUpdateOptions {
  upsert?: boolean;
  writeConcern?: any;
  collation?: any;
}

export interface IFindOneAndUpdateOptions {
  projection?: any;
  sort?: any;
  returnOriginal?: boolean;
  maxTimeMS?: number;
  upsert?: boolean;
}

export interface IConditions {
  [key: string]: any;
}

export interface IUpdate {
  $set?: { [key: string]: any };
  $setOnInsert?: { [key: string]: any };
  $unset?: { [key: string]: any };
  $inc?: { [key: string]: number };
  $dec?: { [key: string]: number };
  $min?: { [key: string]: number };
  $max?: { [key: string]: number };
  $mul?: { [key: string]: number };
  $rename?: { [key: string]: string };
  $currentDate?: { [key: string]: boolean };
  $bit?: {
    [key: string]: {
      or?: number;
      and?: number;
      xor?: number;
    }
  };

  //array
  $addToSet?: { [key: string]: { $each?: any[] } }
  $pop?: { [key: string]: any };
  $pull?: { [key: string]: any };
  $pullAll?: { [key: string]: any };
  $push?: {
    [key: string]: {
      $each?: any[];
      $position?: number;
      $slice?: number;
      $sort?: any;
    }
  };
}

export interface IPipeline {
  $collStats?: {
    latencyStats: { histograms: boolean };
    storageStats: {};
  };
  $project?: { [key: string]: any };
  $match?: { [key: string]: any };
  $redact?: { [key: string]: any };
  $limit?: number;
  $skip?: { [key: string]: any };
  $unwind?: { [key: string]: any };
  $group?: {
    _id: any;
    [key: string]: {
      $sum?: any;
      $addToSet?: any;
      $push?: any;
    };
  };
  $sample?: { [key: string]: any };
  $sort?: { [key: string]: any };
  $geoNear?: { [key: string]: any };
  $lookup?: {
    as: string;
    from: string;
    foreignField: string;
    localField: string;
  };
  $out?: { [key: string]: any };
  $indexStats?: { [key: string]: any };
  $facet?: { [key: string]: any };
  $bucket?: { [key: string]: any };
  $bucketAuto?: { [key: string]: any };
  $sortByCount?: { [key: string]: any };
  $addFields?: { [key: string]: any };
  $replaceRoot?: { [key: string]: any };
  $count?: { [key: string]: any };
  $graphLookup?: { [key: string]: any };
}

export interface Schema {
  _id?: any;
}

export interface IIndexSpec {
  key: { [key: string]: number };
  unique?: boolean;
}

export interface IModelDecorator {
  connection: Promise<Db>;
  collection_name: string;
  indexes?: IIndexSpec[];
}

export interface IInsertOneResult {
  result: {
    ok: number;
    n: number;
  };
  ops: { _id: ObjectId }[];
  insertedCount: number;
  insertedId: ObjectId;
}

export interface IInsertManyResult {
  result: {
    ok: number;
    n: number;
  };
  ops: { _id: ObjectId }[];
  insertedCount: number;
  insertedIds: ObjectId[];
}
