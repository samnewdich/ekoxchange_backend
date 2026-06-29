import type { FastifyReply, FastifyRequest } from "fastify";
import { CODE } from "../constants/http.constant.js";
import { ResponseBuilder } from "../constants/reply.constant.js";

const response = new ResponseBuilder();

export async function ansofraSanitize(req: FastifyRequest, reply: FastifyReply) {
    const body = req.body;

    if (body && typeof body === "object" && !Array.isArray(body)) {
        for (const key in body as Record<string, unknown>) {
            if (key.startsWith("$") || key.includes(".")) {
                return reply
                    .code(CODE.BAD_REQUEST)
                    .send(response.badRequest());
            }

            const value = (body as Record<string, unknown>)[key];

            if (typeof value === "string") {
                (body as Record<string, unknown>)[key] = value.trim();
            }
        }
    }
}