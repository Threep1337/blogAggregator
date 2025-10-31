import { db } from "..";
import { users } from "../schema";
import { eq, lt, gte, ne } from 'drizzle-orm';

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUser(name: string){
    //console.log (`Right before DB query to get user named ${name}`);
    const [result] = await db.select().from(users).where(eq(users.name,name));
    //console.log ("Right after DB query to get user name");
    return result;
}