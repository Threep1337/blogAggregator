import { readConfig, setUser } from "./config";
import { CommandsRegistry,CommandHandler,handlerLogin,registerCommand,runCommand,handlerRegister} from "./command";
import { argv, exit } from 'node:process';

async function main() {

  const registry:CommandsRegistry = {};
  registerCommand(registry,"login",handlerLogin);
  registerCommand(registry,"register",handlerRegister)

  const userArgs = argv.slice(2);
  if (userArgs.length < 1)
  {
    console.log("At least one argument must be provided!");
    exit(1);
  }

  await runCommand(registry,userArgs[0],...userArgs.slice(1));
  process.exit(0);
}

main();
