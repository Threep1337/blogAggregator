// This file is used to handle all of the commands that a user can run.  The command handler functions are exported so that they can be called from other files.

import { readConfig, setUser } from "./config";
import { DBGetUser, DBCreateUser, DBDeleteUsers, DBGetUsers } from "./lib/db/queries/users";
import { DBAddFeed,DBcreateFeedFollow,DBGetFeed,DBgetFeedFollowsForUser,DBListFeeds } from "./lib/db/queries/feeds";
import { fetchFeed } from "./rss";
import { Feed,User } from "./lib/db";
import { UniqueOnConstraintBuilder } from "drizzle-orm/gel-core";

// A CommandHandler type is a function that takes a command name and a variable number of arguments, it processes the arguments and doesn't return anything.
export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

// A CommandsRegistry type is used to map a command name, to a function that handles the command
export type CommandsRegistry = Record<string, CommandHandler>;

// This function handles the users login and calls setUser() to write it to the config file.
export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (!args[0]) {
        throw new Error("A username must be provided.");
    }
    const userName = args[0];

    const userCheck = await DBGetUser(userName);
    if (!userCheck) {
        throw new Error(`User ${userName} doesn't exist, so it can't be set!`);
    }

    setUser(userName);

    console.log(`The username has been set to ${args[0]}`);
}

// This functions registers a new user, and writes it to the database
export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (!args[0]) {
        throw new Error("A username to register must be provided.");
    }

    const userName = args[0];
    console.log(`About to register user ${userName}`);
    const userCheck = await DBGetUser(userName);

    if (userCheck) {
        throw new Error(`User ${userName} is already registered!`);
    }
    const result = await DBCreateUser(userName);
    setUser(result.name);
    console.log(`Created user, the result of the DB query returned is: ${JSON.stringify(result)}`)

}

export async function handlerListFeeds(cmdName: string, ...args: string[]) {
    const feedList = await DBListFeeds();
    for (let feed of feedList){
        console.log(`Name: ${feed.name}`);
        console.log(`URL: ${feed.url}`);
        console.log(`UserName: ${feed.userName}`);
    }
}

export async function handlerFollowFeed(cmdName: string, ...args: string[]) {
    if (!args[0]) {
        throw new Error("A feed url must be provided.");
    }

    //Get the current user first
    const currentUserName = readConfig().currentUserName;
    const currentUser = await DBGetUser(currentUserName);
    const feedToFollow = await DBGetFeed(args[0]);
    const addFeedFollowResult = await DBcreateFeedFollow(feedToFollow,currentUser);
    console.log("Added new feed follow");
    console.log(`User: ${addFeedFollowResult.userName}`);
    console.log(`Feed: ${addFeedFollowResult.feedName}`);
}

// This function resets all users in the database.
export async function handlerResetUsers(cmdName: string, ...args: string[]) {
    const result = await DBDeleteUsers();

    console.log("The users table has been cleared.")

}

// This function lists all users in the database, and displays the currently logged in user.
export async function handlerListUsers(cmdName: string, ...args: string[]) {

    //Get the current user first
    const currentUser = readConfig().currentUserName;

    console.log("Listing users:")
    const result = await DBGetUsers();
    for (let user of result) {
        if (user.name === currentUser) {
            console.log(`${user.name} (current)`);
        } else {
            console.log(user.name);
        }

    }
}

export async function handlerAgg(cmdName: string, ...args: string[]) {
    //console.log ("Right before calling fetchFeed");
    let feed = await fetchFeed("https://www.wagslane.dev/index.xml");
    console.log(JSON.stringify(feed, null, 2));
}

export async function handlerFollowing(cmdName: string, ...args: string[]) {
    //Get the current user first
    const currentUserName = readConfig().currentUserName;
    const currentUser = await DBGetUser(currentUserName);
    const feedsUserFollows = await DBgetFeedFollowsForUser(currentUser);
    console.log(`Listing feeds that ${currentUser.name} Follows...`)
    for (let item of feedsUserFollows){
        console.log(`Feed: ${item.FeedName}`);
    }

}

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
    if (!args[0]) {
        throw new Error("A feed name must be provided");
    }

    if (!args[1]) {
        throw new Error("A feed url must be provided");
    }

    const userName = readConfig().currentUserName;

    if (!userName)
    {
        throw new Error("Can't set a feed without a logged in user!");
    }

    const user = await DBGetUser(userName);

    const newFeed = await DBAddFeed(args[0],args[1],user.id);
    
    const newFeedFollow = await DBcreateFeedFollow(newFeed,user);

    printFeed(newFeed,user);

}

export async function printFeed(feed:Feed,user:User)
{
    console.log(`Feed: ${JSON.stringify(feed,null,2)}`);
    console.log(`User: ${JSON.stringify(user,null,2)}`);
}

// This function registers a command to the commands registry
export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

// This function runs a command from the commands registry.
export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    if (registry[cmdName]) {
        await registry[cmdName](cmdName, ...args);
    } else {
        throw new Error(`No such registered command for ${cmdName}`);
    }
}

