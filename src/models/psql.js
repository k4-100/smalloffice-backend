"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute_query_with_values = exports.execute_query = void 0;
const pg_1 = require("pg");
const constant_1 = require("../common/constant");
// dotenv.config();
// const { env } = process;
// const PSQL_HOSTNAME: string = env.PSQL_HOSTNAME || "127.0.0.1";
// const PSQL_PORT: number = Number(env.PSQL_PORT) || 5432;
// const PSQL_DB: string = env.PSQL_DB || "";
// const PSQL_USERNAME: string = env.PSQL_USERNAME || "";
// const PSQL_PASSWORD: string = env.PSQL_PASSWORD || "";
console.log(constant_1.PSQL_HOSTNAME);
const execute_query = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new pg_1.Client({
        user: constant_1.PSQL_USERNAME,
        database: constant_1.PSQL_DB,
        port: constant_1.PSQL_PORT,
        host: constant_1.PSQL_HOSTNAME,
        password: constant_1.PSQL_PASSWORD,
    });
    // Promise<object | null> => {
    yield client.connect();
    // promise
    return yield client
        .query(query)
        .then((res) => res.rows)
        .catch((e) => {
        console.error("error while executing psql query: ", e.stack);
        return null;
    })
        .finally(() => {
        client.end();
    });
});
exports.execute_query = execute_query;
const execute_query_with_values = (query, values) => __awaiter(void 0, void 0, void 0, function* () {
    // Promise<object | null> => {
    const client = new pg_1.Client({
        user: constant_1.PSQL_USERNAME,
        database: constant_1.PSQL_DB,
        port: constant_1.PSQL_PORT,
        host: constant_1.PSQL_HOSTNAME,
        password: constant_1.PSQL_PASSWORD,
    });
    yield client.connect();
    // promise
    return yield client
        .query(query, values)
        .then((res) => res.rows)
        .catch((e) => {
        console.error("error while executing psql query: ", e.stack);
        return null;
    })
        .finally(() => {
        client.end();
    });
});
exports.execute_query_with_values = execute_query_with_values;
