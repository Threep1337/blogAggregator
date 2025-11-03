// This file is used to read/write to the user configuration file, which is a file in the users home directory '~/.gatorconfig.json'

import fs from "fs";
import os from "os";
import path from "path";

// Define a type for the configuration data
type Config = {
    dbUrl: string,
    currentUserName: string
};

// Use the os module from node to determine the path of the config file.
// The path module is useful for making valid paths
function getConfigFilePath(): string {
    const homedir = os.homedir();
    const configFileName = ".gatorconfig.json"
    const configPath = path.join(homedir, configFileName)
    return configPath;
}


// The function validates the raw config that was read from the json file, and constructs a Config type object
function validateConfig(rawConfig: any) {
    if (!rawConfig.db_url || typeof rawConfig.db_url !== "string") {
        throw new Error("db_url is required in config file");
    }
    if (
        !rawConfig.current_user_name ||
        typeof rawConfig.current_user_name !== "string"
    ) {
        throw new Error("current_user_name is required in config file");
    }

    const config: Config = {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name,
    };

    return config;
}

// This function writes a config object to the configuration file.
function writeConfig(cfg: Config): void {
    const configPath = getConfigFilePath();

    // Make a config object that has properties to match the format we want in the config file.
    const rawConfig = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName,
    };

    // Call JSON.stringify to turn the config object into a string that can be written to the config file.
    const data = JSON.stringify(rawConfig, null, 2);
    fs.writeFileSync(configPath, data, { encoding: "utf-8" });
}

// Set the current user and write it to the config file
export function setUser(currentUser: string): void {
    const config: Config = readConfig();
    config.currentUserName = currentUser;
    writeConfig(config);
}

// Read from the config file, and create a config object.
export function readConfig(): Config {
    const configPath = getConfigFilePath();
    const rawConfig = JSON.parse(fs.readFileSync(configPath, { encoding: "utf-8" }));
    const configObject = validateConfig(rawConfig);
    return configObject;
}