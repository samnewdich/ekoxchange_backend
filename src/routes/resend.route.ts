import type { FastifyInstance } from "fastify";
import { ansofraConfig } from "../configs/env.config.js";
import { ansofraSanitize } from "../middlewares/body.middleware.js";
import { ansofraRateLimit } from "../middlewares/ratelimit.middleware.js";
import { ResendController } from "../controllers/resend.controller.js";
import { ResendSmsService } from "../services/auth/commands/resendsms.service.js";
import { ResendEmailService } from "../services/auth/commands/resendemail.service.js";
import type { SendSmsDto } from "../dtos/send-sms.dto.js";
import type { SendEmailDto } from "../dtos/send-email.dto.js";

export async function resendRoute(app:FastifyInstance) {
    const urlprefix: string = `${ansofraConfig()().APP_BASE_URL}${ansofraConfig()().APP_VERSION}`;
    const resendController = new ResendController(new ResendSmsService(), new ResendEmailService());

    app.post<{Body:SendSmsDto}>(
        urlprefix+'/resendsms', 
        {
            ...ansofraRateLimit(5, "1 minute"),
            preHandler: ansofraSanitize
        }, 
        async (req, res)=>{
        //call controller
        return await resendController.resendSms(req.body, res);
    });

    app.post<{Body:SendEmailDto}>(
        urlprefix+'/resendemail', 
        {
            ...ansofraRateLimit(5, "1 minute"),
            preHandler: ansofraSanitize
        }, 
        async (req, res)=>{
        //call controller
        return await resendController.resendEmail(req.body, res);
    });   
    
}