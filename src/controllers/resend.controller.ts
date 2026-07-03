import type { FastifyReply } from "fastify";
import { CODE } from "../constants/http.constant.js";
import { ResponseBuilder } from "../constants/reply.constant.js";
import type { ResendSmsService } from "../services/auth/commands/resendsms.service.js";
import type { ResendEmailService } from "../services/auth/commands/resendemail.service.js";
import type { SendSmsDto } from "../dtos/send-sms.dto.js";
import type { SendEmailDto } from "../dtos/send-email.dto.js";

const response = new ResponseBuilder();
  
export class ResendController {
  constructor(
    private readonly sms: ResendSmsService,
    private readonly email:ResendEmailService
  ) {}

  async resendSms(data: SendSmsDto, reply: FastifyReply) {
    try {
      const result = await this.sms.sendSms(data, reply);
      return reply
        .code(CODE.CREATED)
        .send(response.created({ data: result }));
    } catch (err) {
      return reply
        .code(CODE.INTERNAL_SERVER_ERROR)
        .send(response.internalServerError(err));
    }
  }


  async resendEmail(data: SendEmailDto, reply: FastifyReply) {
        try {
            const status = await this.email.sendEmail(data, reply);
            return reply.code(CODE.OK).send(response.ok({ data: status }));
        } catch (err) {
            return reply
                .code(CODE.INTERNAL_SERVER_ERROR)
                .send(response.internalServerError(err));
        }
    }
}