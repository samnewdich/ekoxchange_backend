import "fastify";
import type { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
    interface FastifyContextConfig {
        rateLimit?: {
            max: number;
            timeWindow: string | number;
        };
    }

    interface FastifyInstance {
        authenticate: (
            request: FastifyRequest,
            reply: FastifyReply
        ) => Promise<void>;
    }
}