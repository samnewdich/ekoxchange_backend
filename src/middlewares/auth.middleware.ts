import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { CODE } from "../constants/http.constant.js";
import { ResponseBuilder } from "../constants/reply.constant.js";
const response = new ResponseBuilder();

export async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        // Verify the "Authorization: Bearer <token>" header
        // This decodes the JWT and puts the payload on request.user
        await request.jwtVerify();
    } catch (err) {
        return reply
            .code(CODE.UNAUTHORIZED)
            .send(response.unauthorized(
                { status: "failed", response: "Unauthorized: invalid or missing token" }
        ));
    }
}

// Helper to register it on the app as a decorator
export function registerAuthDecorators(app: FastifyInstance) {
    app.decorate("authenticate", authenticate);
}