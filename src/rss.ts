import { Agent } from "node:http";
import { XMLParser } from "fast-xml-parser";
import { error } from "node:console";
import { desc } from "drizzle-orm";
import { DBAddFeed, DBGetNextFeedToFetch, DBMarkFeedFetched } from "./lib/db/queries/feeds";
import { feeds } from "./lib/db/schema";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed>{
    //https://www.wagslane.dev/index.xml
    console.log (feedURL);
    
    const response = await fetch(feedURL,{
        method: "GET",
        mode: "cors",
        headers: {
            "User-Agent": "gator"
        }
    });

    if (!response.ok)
    {
        throw new Error ("The fetch request failed!");
    }

    const text = await response.text()
    const parser = new XMLParser();
    const parsedResponse = parser.parse(text);
    const stringResponse = JSON.stringify(parsedResponse);

    if (!parsedResponse.rss.channel)
    {
        throw new Error ("No RSS channel!");
    }

    const title = parsedResponse.rss.channel.title;
    const link = parsedResponse.rss.channel.link;
    const description = parsedResponse.rss.channel.description;

    if (!title)
    {
        throw new Error ("title is missing from RSS channel!");
    }
    if (!link)
    {
        throw new Error ("link is missing from RSS channel!");
    }
    if (!description)
    {
        throw new Error ("description is missing from RSS channel!");
    }

    let item = parsedResponse.rss.channel.item;

    let parsedItems:RSSItem[] = [];

    if (!Array.isArray(item)){
        item = [];
    }


    for (let element of item){
        let title = element.title;
        let link = element.link;
        let description = element.description;
        let pubDate = element.pubDate;

        if (!title || !link || !description || ! pubDate){
            console.log("Skipping an invalid item");
            continue;
        }
        parsedItems.push({
            title:title,
            link:link,
            description:description,
            pubDate:pubDate
        });

    }

    const feedToReturn:RSSFeed = 
    {
        channel:{
            title:title,
            link: link,
            description:description,
            item: parsedItems
        }
    }
    return feedToReturn;

}

export async function addFeed(name: string,url:string,user_id:string)
{
    DBAddFeed(name, url,user_id)
}

export async function scrapeFeeds(){
    const feedToFetch = await DBGetNextFeedToFetch();
    DBMarkFeedFetched(feedToFetch);
    let feedData = await fetchFeed(feedToFetch.url);
    //console.log(JSON.stringify(feedData, null, 2));

    for (let feedChannelItem of feedData.channel.item){
        console.log(feedChannelItem.title);
    }

    
}