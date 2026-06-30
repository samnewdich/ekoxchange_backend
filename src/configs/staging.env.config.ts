import dotenv from "dotenv";

dotenv.config();

export function stagingConfig(): Record<string, string> {
    const allEnv = process.env;
    const onlyDev: Record<string, string> = {};

    for (const key in allEnv) {
        if (key.endsWith("_STAGING")) {
            const newKey = key.replace(/_STAGING$/, "");

            const value = allEnv[key];

            if (value === undefined) {
                throw new Error(`Missing environment variable: ${key}`);
            }

            onlyDev[newKey] = value;
        }
    }

    return onlyDev;
}