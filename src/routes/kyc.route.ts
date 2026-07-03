import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { KycController } from "../controllers/kyc.controller.js";
import { CreateApplicantService } from "../services/kyc/commands/createApplicant.service.js";
import { GetKycStatusService } from "../services/kyc/queries/getKycStatus.service.js";
import { ansofraSanitize } from "../middlewares/body.middleware.js";
import { ansofraRateLimit } from "../middlewares/ratelimit.middleware.js";

export async function kycRoute(app: FastifyInstance) {
    const controller = new KycController(
        new CreateApplicantService(),
        new GetKycStatusService()
    );

    // Start KYC — creates applicant + mints SDK token
    app.post(
        "/kyc/applicant",
        {
            ...ansofraRateLimit(5, "1 minute"),
            preHandler: [app.authenticate, ansofraSanitize],
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const userId = (request as any).user?.id;
            return controller.createApplicant(userId, reply);
        }
    );

    // Poll KYC status
    app.get(
        "/kyc/status",
        {
            ...ansofraRateLimit(10, "1 minute"),
            preHandler: [app.authenticate],
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const userId = (request as any).user?.id;
            return controller.getKycStatus(userId, reply);
        }
    );
}