import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const { env } = process;

const PSQL_HOSTNAME: string = env.PSQL_HOSTNAME || "127.0.0.1";
const PSQL_PORT: number = Number(env.PSQL_PORT) || 5432;
const PSQL_DB: string = env.PSQL_DB || "";
const PSQL_USERNAME: string = env.PSQL_USERNAME || "";
const PSQL_PASSWORD: string = env.PSQL_PASSWORD || "";

const execute_query = async (query: string): Promise<object | null> => {
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
    .query(query)
    .then((res) => res.rows)
    .catch((e) => {
      console.log("err: ", e.stack);
      return null;
    })
    .finally(() => {
      client.end();
    });
};

export { execute_query };
