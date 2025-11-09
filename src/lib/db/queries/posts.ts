import { db, Post } from "..";
import { feeds, feedsFollows, posts, users } from "../schema";
import { eq, lt, gte, ne,and,sql,desc } from 'drizzle-orm';
import { Feed,User } from "../";
import { RSSItem } from "src/rss";
import { date } from "drizzle-orm/mysql-core";


export async function DBcreatePost(feed:Feed,postData:RSSItem)
{

    const [newPost] = await db.insert(posts).values({
        title:postData.title,
        url: postData.link,
        description: postData.description,
        publishedAt: new Date(postData.pubDate),
        feedId:feed.id
    });

}

export async function DBGetPostsForUser(user:User):Promise<Post[]>{
    const usersPosts = await db.select().from(posts).where(in())
}