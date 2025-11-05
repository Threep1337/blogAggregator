// This file contains the queries that will be used to interact with the users table, it is done throng drizzle.

import { db } from "..";
import { feeds, users } from "../schema";
import { eq, lt, gte, ne } from 'drizzle-orm';
import { Feed,User } from "../";

export async function DBCreateUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function DBGetUser(name: string) {
  const [result] = await db.select().from(users).where(eq(users.name, name));
  return result;
}

export async function DBDeleteUsers() {
  const [result] = await db.delete(users);
  return result;
}

export async function DBGetUsers() {
  const result = await db.select().from(users);
  return result;
}

