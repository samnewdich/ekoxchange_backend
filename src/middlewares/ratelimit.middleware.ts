import type { FastifyInstance } from "fastify";

export function ansofraRateLimit(max: number, timeWindow: string | number) {
    return {
        config: {
            rateLimit: {
                max,
                timeWindow,
            },
        },
    };
}