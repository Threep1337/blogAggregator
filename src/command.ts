import { create } from "domain";
import { setUser } from "./config";
import { getUser, createUser } from "./lib/db/queries/users";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;


export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (!args[0]) {
        throw new Error("A username must be provided.");
    }
    const userName = args[0];
    setUser(userName);

    const userCheck = await getUser(userName);
    if (!userCheck) {
        throw new Error(`User ${userName} doesn't exist, so it can't be set!`);
    }

    console.log(`The username has been set to ${args[0]}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (!args[0]) {
        throw new Error("A username to register must be provided.");
    }


    const userName = args[0];
    console.log (`About to register user ${userName}`);
    
    const userCheck = await getUser(userName);
    if (userCheck) {
        throw new Error(`User ${userName} is already registered!`);
    }
    const result = await createUser(userName);
    setUser(result.name);
    console.log(`Created user, the result of the DB query returned is: ${JSON.stringify(result)}`)

}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler) {
    registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]) {
    if (registry[cmdName]) {
        await registry[cmdName](cmdName, ...args);
    } else {
        throw new Error(`No such registered command for ${cmdName}`);
    }
}