import { readConfig, setUser } from "./config";
import { CommandsRegistry, CommandHandler, handlerLogin, registerCommand, runCommand, handlerRegister, handlerResetUsers, handlerListUsers, handlerAgg, handlerAddFeed, handlerListFeeds, handlerFollowFeed, handlerFollowing, handlerUnfollowFeed, handlerDebug } from "./command";
import { argv, exit } from 'node:process';
import { middlewareLoggedIn } from "./middleware";
async function main() {

  // Create a commands registry, and register the commands.
  // This is done so that when a user inputs a command we can validate that it exists, and if it does, call the appropriate handler function.
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "reset", handlerResetUsers);
  registerCommand(registry, "users", handlerListUsers);
  registerCommand(registry, "agg", handlerAgg);
  registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
  registerCommand(registry, "feeds", handlerListFeeds);
  registerCommand(registry, "follow", middlewareLoggedIn(handlerFollowFeed));
  registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
  registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollowFeed));
  registerCommand(registry, "debug",handlerDebug);

  // Args passed in to node are in an arrat called argv
  // The argv[0] is the path to the node binary '/home/threep/.nvm/versions/node/v20.17.0/bin/node'
  // argv[1] is the path to the file being called '/home/threep/bootdev/blogAggregator/src/index.ts'
  // The rest are the commands the user entered
  //console.log (argv);
  const userArgs = argv.slice(2);
  if (userArgs.length < 1) {
    console.log("At least one argument must be provided!");
    exit(1);
  }

  // run the command from the commands registry, using the arguments that the user passed in.
  await runCommand(registry, userArgs[0], ...userArgs.slice(1));
  process.exit(0);
}

main();
