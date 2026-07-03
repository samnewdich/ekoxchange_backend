import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyRawBody from 'fastify-raw-body';

import { userRoute } from './routes/user.route.js';
import { authRoute } from './routes/auth.route.js';
import { kycRoute } from './routes/kyc.route.js';
import { handleSumsubWebhook } from './webhooks/sumsub.webhook.js';
import { registerAuthDecorators } from './middlewares/auth.middleware.js';
import { ansofraConfig } from './configs/env.config.js';

export async function buildApp(): Promise<FastifyInstance> {
    const app = Fastify({ logger: true });

    // 1. JWT plugin (must be first)
    app.register(fastifyJwt, {
        secret: ansofraConfig()().JWT_SECRET!
    });

    // 2. Auth decorator (depends on JWT)
    registerAuthDecorators(app);

    // 3. Raw body for webhook signature verification
    await app.register(fastifyRawBody, {
        field: 'rawBody',
        global: false,
        runFirst: true,
        encoding: false,
    });

    // 4. Public routes (login, register, etc.)
    app.register(authRoute);

    // 5. Protected routes
    app.register(kycRoute);
    app.register(userRoute);

    // 6. Webhook (no auth — Sumsub signs its own requests)
    app.post('/webhooks/sumsub', {
        config: { rawBody: true },
        handler: async (req, reply) => {
            try {
                await handleSumsubWebhook(req.rawBody as Buffer, req.headers as any);
                return reply.code(200).send({ status: "ok" });
            } catch (err) {
                req.log.error(err);
                return reply.code(400).send({ error: (err as Error).message });
            }
        },
    });

    return app;
}








/*import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { userRoute } from './routes/user.route.js';
import { authRoute } from './routes/auth.route.js';
import fastifyJwt from '@fastify/jwt';
import { ansofraConfig } from './configs/env.config.js';
import { kycRoute } from './routes/kyc.route.js';
import fastifyRawBody from 'fastify-raw-body';   // npm i fastify-raw-body
import { handleSumsubWebhook } from './webhooks/sumsub.webhook.js';
import { registerAuthDecorators } from './middlewares/auth.middleware.js';

export function buildApp(): FastifyInstance{
    const app = Fastify(
        {
            logger: true
        }
    );

    // inside buildApp(), before the route registration:
    app.register(fastifyRawBody, {
        field: 'rawBody',
        global: false,
        runFirst: true,
        encoding: false,
    });

    app.register(fastifyJwt, {
        secret: ansofraConfig()().JWT_SECRET!
    });

    registerAuthDecorators(app);

    app.register(kycRoute);

    app.post('/webhooks/sumsub', {
    config: { rawBody: true },
    handler: async (req, reply) => {
        try {
        await handleSumsubWebhook(req.rawBody as Buffer, req.headers as any);
        return reply.code(200).send({ status: "ok" });
        } catch (err) {
        req.log.error(err);
        return reply.code(400).send({ error: (err as Error).message });
        }
    },
    });
    

    app.register(authRoute);
    app.register(userRoute);

    return app;
}
*/

