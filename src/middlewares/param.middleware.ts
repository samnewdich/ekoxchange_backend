import type { FastifyReply, FastifyRequest } from "fastify";
import { CODE } from "../constants/http.constant.js";
import { ResponseBuilder } from "../constants/reply.constant.js";
const response = new ResponseBuilder();

export function ansofraSanitize(req: FastifyRequest, reply: FastifyReply) {
    const params = req.params as Record<string, unknown>;
    if (params && typeof params === "object" && !Array.isArray(params)) {
        for (const key in params) {
            const value = params[key];

            if (typeof value === "string") {
                const trimmed = value.trim();

                if (trimmed.includes("\0")) {
                    return reply.code(CODE.BAD_REQUEST).send(response.badRequest());
                }

                params[key] = trimmed;
            }
        }
    }
}