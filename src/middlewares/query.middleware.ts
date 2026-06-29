import type { FastifyReply, FastifyRequest } from "fastify";
import { CODE } from "../constants/http.constant.js";
import { ResponseBuilder } from "../constants/reply.constant.js";
const response = new ResponseBuilder();

export function ansofraSanitize(req: FastifyRequest, reply: FastifyReply) {
    const query = req.query as Record<string, unknown>;
    if (query && typeof query === "object" && !Array.isArray(query)) {
        for (const key in query) {
            if (key.startsWith("$") || key.includes(".")) {
                return reply.code(400).send({
                    message: "Invalid query parameter."
                });
            }

            const value = query[key];

            if (typeof value === "string") {
                const trimmed = value.trim();

                if (trimmed.includes("\0")) {
                    return reply.code(CODE.BAD_REQUEST).send(response.badRequest());
                }

                query[key] = trimmed;
            }
        }
    }
}