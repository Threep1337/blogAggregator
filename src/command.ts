// This file is used to handle all of the commands that a user can run.  The command handler functions are exported so that they can be called from other files.

import { readConfig, setUser } from "./config";
import { getUser, createUser, deleteUsers, getUsers, addDBFeed } from "./lib/db/queries/users";
import { fetchFeed } from "./rss";
import { Feed,User } from "./lib/db";

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

    const userCheck = await getUser(userName);
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
    const userCheck = await getUser(userName);

    if (userCheck) {
        throw new Error(`User ${userName} is already registered!`);
    }
    const result = await createUser(userName);
    setUser(result.name);
    console.log(`Created user, the result of the DB query returned is: ${JSON.stringify(result)}`)

}

// This function resets all users in the database.
export async function handlerResetUsers(cmdName: string, ...args: string[]) {
    const result = await deleteUsers();

    console.log("The users table has been cleared.")


}

// This function lists all users in the database, and displays the currently logged in user.
export async function handlerListUsers(cmdName: string, ...args: string[]) {

    //Get the current user first
    const currentUser = readConfig().currentUserName;

    console.log("Listing users:")
    const result = await getUsers();
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

    const userID = (await getUser(userName)).id;

    await addDBFeed(args[0],args[1],userID);

}

export async function printFeed(feed:Feed,user:User)
{
    
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

