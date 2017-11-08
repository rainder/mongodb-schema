"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
exports.ObjectId = mongodb_1.ObjectId;
const all_1 = require("./lib/all");
exports.BaseModel = all_1.BaseModel;
exports.Model = all_1.Model;
const connection_1 = require("./lib/connection");
exports.createConnection = connection_1.createConnection;
//# sourceMappingURL=index.js.map