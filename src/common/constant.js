"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_TOKEN_SECRET = exports.ACCESS_TOKEN_SECRET = exports.PSQL_DEFAULT_SCHEMA = exports.PSQL_DB = exports.PSQL_PORT = exports.PSQL_HOSTNAME = exports.PSQL_PASSWORD = exports.PSQL_USERNAME = exports.NODE_PORT = exports.NODE_HOSTNAME = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const NODE_ENV = process.env.NODE_ENV === "docker" ? "docker" : "default";
if (NODE_ENV === "docker")
    dotenv_1.default.config({ path: path_1.default.join(__dirname, `./.env.${NODE_ENV}`) });
else
    NODE_ENV === "docker";
dotenv_1.default.config({ path: path_1.default.join(__dirname, `../../.env.${NODE_ENV}`) });
// console.log(path.join(__dirname, `../../.env.${NODE_ENV}`));
console.log(process.env.NODE_ENV);
const { env } = process;
const NODE_HOSTNAME = env.NODE_HOSTNAME || "0.0.0.0";
exports.NODE_HOSTNAME = NODE_HOSTNAME;
const NODE_PORT = Number(env.NODE_PORT) || 5000;
exports.NODE_PORT = NODE_PORT;
const PSQL_USERNAME = env.PSQL_USERNAME || "mock";
exports.PSQL_USERNAME = PSQL_USERNAME;
const PSQL_PASSWORD = env.PSQL_PASSWORD || "4321";
exports.PSQL_PASSWORD = PSQL_PASSWORD;
const PSQL_HOSTNAME = env.PSQL_HOSTNAME || "0.0.0.0";
exports.PSQL_HOSTNAME = PSQL_HOSTNAME;
const PSQL_PORT = Number(env.PSQL_PORT) || 5432;
exports.PSQL_PORT = PSQL_PORT;
const PSQL_DB = env.PSQL_DB || "smalloffice";
exports.PSQL_DB = PSQL_DB;
const PSQL_DEFAULT_SCHEMA = env.PSQL_DEFAULT_SCHEMA || "main_smalloffice_schema";
exports.PSQL_DEFAULT_SCHEMA = PSQL_DEFAULT_SCHEMA;
const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET || "acc";
exports.ACCESS_TOKEN_SECRET = ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET || "ref";
exports.REFRESH_TOKEN_SECRET = REFRESH_TOKEN_SECRET;
