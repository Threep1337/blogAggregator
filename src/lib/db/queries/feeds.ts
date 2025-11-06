import { db } from "..";
import { feeds, feedsFollows, users } from "../schema";
import { eq, lt, gte, ne } from 'drizzle-orm';
import { Feed,User } from "../";

export async function DBAddFeed(name: string,url:string,user_id:string): Promise<Feed>
{
  const [newFeed] = await db.insert(feeds).values({name:name,url:url,user_id:user_id}).returning();
  return newFeed;
}

export async function DBListFeeds()
{

  const FeedList = await db.select({
    name:feeds.name,
    url:feeds.url,
    userName:users.name
  }).from(feeds).innerJoin(users, eq(feeds.user_id,users.id));

  return FeedList;
}

export async function DBcreateFeedFollow(feed:Feed,user:User)
{

  const [newFeedFollow] = await db.insert(feedsFollows).values({feed_id: feed.id,user_id:user.id}).returning();
  const [returnFeedFollow] = await db.select({
    id: feedsFollows.id,
    createdAt: feedsFollows.createdAt,
    updatedAt: feedsFollows.updatedAt,
    feedName: feeds.name,
    feedURL: feeds.url,
    userName: users.name
  }).from(feedsFollows).innerJoin(users,eq(feedsFollows.user_id,users.id)).innerJoin(feeds,eq(feedsFollows.feed_id,feeds.id)).where(eq(feedsFollows.id,newFeedFollow.id));
  return returnFeedFollow;
}

export async function DBGetFeed(feedUrl:string){
    const [result] = await db.select().from(feeds).where(eq(feeds.url, feedUrl));
    return result;
}

export async function DBgetFeedFollowsForUser(user:User){
  const result = await db.select({
    FeedName: feeds.name,
    UserName: users.name
  }).from(feedsFollows).innerJoin(users,eq(feedsFollows.user_id,users.id)).innerJoin(feeds,eq(feedsFollows.feed_id,feeds.id)).where(eq(users.id,user.id));
  return result;
}