import { Client } from "pg";
import dotenv from "dotenv";
import {
  PSQL_DB,
  PSQL_HOSTNAME,
  PSQL_PASSWORD,
  PSQL_PORT,
  PSQL_USERNAME,
} from "../common/constant";

// dotenv.config();

// const { env } = process;

// const PSQL_HOSTNAME: string = env.PSQL_HOSTNAME || "127.0.0.1";
// const PSQL_PORT: number = Number(env.PSQL_PORT) || 5432;
// const PSQL_DB: string = env.PSQL_DB || "";
// const PSQL_USERNAME: string = env.PSQL_USERNAME || "";
// const PSQL_PASSWORD: string = env.PSQL_PASSWORD || "";

console.log(PSQL_DB);
console.log(PSQL_HOSTNAME);
console.log(PSQL_PASSWORD);
console.log(PSQL_PORT);
console.log(PSQL_USERNAME);

const execute_query = async (query: string): Promise<any> => {
  const client = new Client({
    user: PSQL_USERNAME,
    database: PSQL_DB,
    port: PSQL_PORT,
    host: PSQL_HOSTNAME,
    password: PSQL_PASSWORD,
  });
  // Promise<object | null> => {
  await client.connect();
  // promise
  return await client
    .query(query)
    .then((res) => res.rows)
    .catch((e) => {
      console.error("error while executing psql query: ", e.stack);
      return null;
    })
    .finally(() => {
      client.end();
    });
};

const execute_query_with_values = async (
  query: string,
  values: any[]
): Promise<any> => {
  // Promise<object | null> => {
  const client = new Client({
    user: PSQL_USERNAME,
    database: PSQL_DB,
    port: PSQL_PORT,
    host: PSQL_HOSTNAME,
    password: PSQL_PASSWORD,
  });

  await client.connect();
  // promise
  return await client
    .query(query, values)
    .then((res) => res.rows)
    .catch((e) => {
      console.error("error while executing psql query: ", e.stack);
      return null;
    })
    .finally(() => {
      client.end();
    });
};

export { execute_query, execute_query_with_values };
