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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute_query = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { env } = process;
const PSQL_HOSTNAME = env.PSQL_HOSTNAME || "127.0.0.1";
const PSQL_PORT = Number(env.PSQL_PORT) || 5432;
const PSQL_DB = env.PSQL_DB || "";
const PSQL_USERNAME = env.PSQL_USERNAME || "";
const PSQL_PASSWORD = env.PSQL_PASSWORD || "";
const execute_query = (query) => __awaiter(void 0, void 0, void 0, function* () {
    // Promise<object | null> => {
    const client = new pg_1.Client({
        user: PSQL_USERNAME,
        database: PSQL_DB,
        port: PSQL_PORT,
        host: PSQL_HOSTNAME,
        password: PSQL_PASSWORD,
    });
    yield client.connect();
    // promise
    return yield client
        .query(query)
        .then((res) => res.rows)
        .catch((e) => {
        console.log("err: ", e.stack);
        return null;
    })
        .finally(() => {
        client.end();
    });
});
exports.execute_query = execute_query;
//# sourceMappingURL=psql.js.map