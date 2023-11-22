import dotenv from "dotenv";
import path from "path";

const NODE_ENV: string =
  process.env.NODE_ENV === "docker" ? "docker" : "default";
if (NODE_ENV === "docker")
  dotenv.config({ path: path.join(__dirname, `./.env.${NODE_ENV}`) });
else NODE_ENV === "docker";
dotenv.config({ path: path.join(__dirname, `../../.env.${NODE_ENV}`) });

// console.log(path.join(__dirname, `../../.env.${NODE_ENV}`));
console.log(process.env.NODE_ENV);

const { env } = process;

const NODE_HOSTNAME: string = env.NODE_HOSTNAME || "0.0.0.0";
const NODE_PORT: number = Number(env.NODE_PORT) || 5000;

const PSQL_USERNAME: string = env.PSQL_USERNAME || "mock";
const PSQL_PASSWORD: string = env.PSQL_PASSWORD || "4321";
const PSQL_HOSTNAME: string = env.PSQL_HOSTNAME || "0.0.0.0";
const PSQL_PORT: number = Number(env.PSQL_PORT) || 5432;
const PSQL_DB: string = env.PSQL_DB || "smalloffice";
const PSQL_DEFAULT_SCHEMA =
  env.PSQL_DEFAULT_SCHEMA || "main_smalloffice_schema";

const ACCESS_TOKEN_SECRET: string = env.ACCESS_TOKEN_SECRET || "acc";
const REFRESH_TOKEN_SECRET: string = env.REFRESH_TOKEN_SECRET || "ref";

export {
  NODE_HOSTNAME,
  NODE_PORT,
  PSQL_USERNAME,
  PSQL_PASSWORD,
  PSQL_HOSTNAME,
  PSQL_PORT,
  PSQL_DB,
  PSQL_DEFAULT_SCHEMA,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
};
