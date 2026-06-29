import dotenv from "dotenv";

dotenv.config();

export function prodConfig(): Record<string, string> {
    const allEnv = process.env;
    const onlyProd: Record<string, string> = {};

    for (const key in allEnv) {
        if (!key.endsWith("_DEV")) {
            const value = allEnv[key];

            if (value === undefined) {
                throw new Error(`Missing environment variable: ${key}`);
            }

            onlyProd[key] = value;
        }
    }

    return onlyProd;
}