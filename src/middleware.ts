import { User } from "./lib/db";
import { CommandHandler } from "./command";
import { readConfig } from "./config";
import { DBGetUser } from "./lib/db/queries/users";
import { UserCommandHandler } from "./command";

//type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export function middlewareLoggedIn(
  handler: UserCommandHandler,
): CommandHandler {
  return async (cmdName: string, ...args: string[]): Promise<void> => {
    const config = readConfig();
    const userName = config.currentUserName;
    if (!userName) {
      throw new Error("User not logged in");
    }

    const user = await DBGetUser(userName);
    if (!user) {
      throw new Error(`User ${userName} not found`);
    }

    await handler(cmdName, user, ...args);
  };
}
