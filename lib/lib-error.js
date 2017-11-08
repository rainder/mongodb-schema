"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MongoDBSchemaError {
    constructor(code, message, info) {
        this.code = code;
        this.message = message;
        this.info = info;
    }
    static create(code, message) {
        return (info) => {
            return new MongoDBSchemaError(code, message, info);
        };
    }
}
MongoDBSchemaError.RECORD_NOT_FOUND = MongoDBSchemaError.create(404, 'Record could not be found');
exports.MongoDBSchemaError = MongoDBSchemaError;
//# sourceMappingURL=lib-error.js.map