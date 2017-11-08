export class MongoDBSchemaError {
  static RECORD_NOT_FOUND = MongoDBSchemaError.create(404, 'Record could not be found');


  constructor(
    public code: number,
    public message: string,
    public info: any,
  ) {
  }

  static create(code: number, message: string) {
    return (info?: any) => {
      return new MongoDBSchemaError(code, message, info);
    };
  }
}
