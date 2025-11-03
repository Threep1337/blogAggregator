// This file contains the queries that will be used to interact with the users table, it is done throng drizzle.

import { db } from "..";
import { feeds, users } from "../schema";
import { eq, lt, gte, ne } from 'drizzle-orm';

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUser(name: string) {
  const [result] = await db.select().from(users).where(eq(users.name, name));
  return result;
}

export async function deleteUsers() {
  const [result] = await db.delete(users);
  return result;
}

export async function getUsers() {
  const result = await db.select().from(users);
  return result;
}

export async function addDBFeed(name: string,url:string,user_id:string)
{
  await db.insert(feeds).values({name:name,url:url,user_id:user_id});
}