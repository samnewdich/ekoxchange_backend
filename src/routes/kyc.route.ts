import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { KycController } from "../controllers/kyc.controller.js";
import { CreateApplicantService } from "../services/kyc/commands/createApplicant.service.js";
import { ansofraSanitize } from "../middlewares/body.middleware.js";
import { ansofraRateLimit } from "../middlewares/ratelimit.middleware.js";

export async function kycRoute(app: FastifyInstance) {
  // Protect this route with your existing auth decorator (e.g. app.authenticate)
  // app.addHook("onRequest", app.authenticate);

  const controller = new KycController(new CreateApplicantService());
    
  app.post(
    "/kyc/applicant",
    {
        ...ansofraRateLimit(5, "1 minute"),
        preHandler: ansofraSanitize
    },    // remove if you don't have this yet
    async (request: FastifyRequest, reply: FastifyReply) => {
      const email = (request as any).user?.email;   // set by your JWT auth hook
      return controller.createApplicant(email, reply);
    }
  );
}