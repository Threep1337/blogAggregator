import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import { readConfig } from "../../config";

const config = readConfig();
console.log (config.dbUrl);

const conn = postgres(config.dbUrl);
//const conn = postgres(config.dbUrl, { ssl: false }); // ✅ important
export const db = drizzle(conn, { schema });