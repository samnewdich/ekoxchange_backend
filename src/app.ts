import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { userRoute } from './routes/user.route.js';
import { authRoute } from './routes/auth.route.js';
import fastifyJwt from '@fastify/jwt';
import { ansofraConfig } from './configs/env.config.js';

export function buildApp(): FastifyInstance {
    const app = Fastify(
        {
            logger: true
        }
    );

    app.register(authRoute);
    app.register(userRoute);

    app.register(fastifyJwt, {
        secret: ansofraConfig()().JWT_SECRET!
    });

    return app;
}