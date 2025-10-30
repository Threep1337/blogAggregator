import fs from "fs";
import os from "os";
import path from "path";


export type Config = {
    dbUrl: string,
    currentUserName: string
};


function getConfigFilePath(): string {
    const homedir = os.homedir();
    const configFileName = ".gatorconfig.json"
    const configPath = path.join(homedir, configFileName)
    return configPath;
}



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


function writeConfig(cfg: Config): void {
    const configPath = getConfigFilePath();
    const rawConfig = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName,
    };

    const data = JSON.stringify(rawConfig, null, 2);
    fs.writeFileSync(configPath, data, { encoding: "utf-8" });
}

export function setUser(currentUser: string): void {
    //const currentUser = os.userInfo().username;
    const config: Config = readConfig();
    config.currentUserName = currentUser;
    writeConfig(config);
}

export function readConfig(): Config {
    const configPath = getConfigFilePath();
    const rawConfig = JSON.parse(fs.readFileSync(configPath, { encoding: "utf-8" }));
    const configObject = validateConfig(rawConfig);
    return configObject;
}