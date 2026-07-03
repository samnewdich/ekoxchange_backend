import { buildApp } from "./app.js";
import { ansofraConfig } from "./configs/env.config.js";

const start = async (): Promise<void> => {
    try {
        const app = await buildApp();          // 👈 await #1
        const config = ansofraConfig()();

        await app.listen({
            port: Number(config.APP_PORT!),
            host: config.APP_HOST!,
        });

        app.log.info(`Server started on ${config.APP_HOST}:${config.APP_PORT}`);
    } catch (err) {
        console.error(err);                    // 👈 app doesn't exist if buildApp() threw
        process.exit(1);
    }
};

start();


/*import { buildApp } from "./app.js";
import { ansofraConfig } from "./configs/env.config.js";

const app = buildApp();

const start = async (): Promise<void> => {
    try {
        const config = ansofraConfig()();

        await app.listen({
            port: Number(config.APP_PORT!),
            host: config.APP_HOST!
        });

        app.log.info(`Server started on ${config.APP_HOST}:${config.APP_PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();

*/