import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { userRoute } from './routes/user.route.js';
import { authRoute } from './routes/auth.route.js';
import fastifyJwt from '@fastify/jwt';
import { ansofraConfig } from './configs/env.config.js';
import { kycRoute } from './routes/kyc.route.js';
import fastifyRawBody from 'fastify-raw-body';   // npm i fastify-raw-body
import { handleSumsubWebhook } from './webhooks/sumsub.webhook.js';

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

    app.register(fastifyJwt, {
        secret: ansofraConfig()().JWT_SECRET!
    });

    return app;
}


