import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import { readConfig } from "../../config";

const config = readConfig();

const conn = postgres(config.dbUrl);
export const db = drizzle(conn, { schema });

export type Feed = typeof schema.feeds.$inferSelect; // feeds is the table object in schema.ts
export type User = typeof schema.users.$inferSelect; // feeds is the table object in schema.ts