import type { FastifyInstance } from "fastify";
import { ansofraConfig } from "../configs/env.config.js";
import { ansofraSanitize } from "../middlewares/body.middleware.js";
import { ansofraRateLimit } from "../middlewares/ratelimit.middleware.js";
import { KycController } from "../controllers/kyc.controller.js";
import type { User } from "../generated/mongodb/wasm.js";

export async function kycRoute(app:FastifyInstance) {
    const urlprefix: string = `${ansofraConfig()().APP_BASE_URL}${ansofraConfig()().APP_VERSION}`;
    const kycController = new KycController();

    //for authenticator verification
    app.post<{Body:User}>(
        urlprefix+'/kyc/applicant', 
        {
            ...ansofraRateLimit(5, "1 minute"),
            preHandler: ansofraSanitize
        }, 
        async (req, res)=>{
        //call controller
        return await kycController.createApplicant(req.body, res);
    });
    
    
}