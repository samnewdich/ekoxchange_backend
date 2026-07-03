import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { KycController } from "../controllers/kyc.controller.js";
import { CreateApplicantService } from "../services/kyc/commands/createApplicant.service.js";
import { ansofraSanitize } from "../middlewares/body.middleware.js";
import { ansofraRateLimit } from "../middlewares/ratelimit.middleware.js";
import { GetKycStatusService } from "../services/kyc/queries/getKycStatus.service.js";

export async function kycRoute(app: FastifyInstance) {
  // Protect this route with your existing auth decorator (e.g. app.authenticate)
  // app.addHook("onRequest", app.authenticate);

  const controller = new KycController(new CreateApplicantService(), new GetKycStatusService());
    
  app.post(
    "/kyc/applicant",
    {
        ...ansofraRateLimit(5, "1 minute"),
        preHandler: [app.authenticate, ansofraSanitize],   // 👈 array runs in order
    },    // remove if you don't have this yet
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = (request as any).user?.id;   // set by your JWT auth hook
      return controller.createApplicant(userId, reply);
    }
  );

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