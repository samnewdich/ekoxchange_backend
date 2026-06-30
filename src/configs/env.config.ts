import dotenv from "dotenv";
import { devConfig } from "./development.env.config.js";
import { stagingConfig } from "./staging.env.config.js";
import { prodConfig } from "./production.env.config.js";

dotenv.config();

export function ansofraConfig() {
    if (process.env.APP_ENVIRONMENT?.toLowerCase() === "production") {
        return prodConfig;
    }
    else if (process.env.APP_ENVIRONMENT?.toLowerCase() === "staging") {
        return stagingConfig;
    }

    return devConfig;
}