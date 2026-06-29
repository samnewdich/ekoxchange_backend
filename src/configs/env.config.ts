import dotenv from "dotenv";
import { devConfig } from "./development.env.config.js";
import { prodConfig } from "./production.env.config.js";

dotenv.config();

export function ansofraConfig() {
    if (process.env.APP_ENVIRONMENT?.toLowerCase() === "production") {
        return prodConfig;
    }

    return devConfig;
}