import { readConfig, setUser } from "./config";

function main() {
  setUser("Threep");
  const config = readConfig();
  console.log(config);

}

main();
