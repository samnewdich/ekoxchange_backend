import type { FastifyReply } from "fastify";
import { CODE } from "../constants/http.constant.js";
import { ResponseBuilder } from "../constants/reply.constant.js";
import { CreateApplicantService } from "../services/kyc/commands/createApplicant.service.js";
import { GetKycStatusService } from "../services/kyc/queries/getKycStatus.service.js";

const response = new ResponseBuilder();

export class KycController {
  constructor(
    private readonly service: CreateApplicantService,
    private readonly getKycStatusService: GetKycStatusService
  ) {}

  async createApplicant(userId: string, reply: FastifyReply) {
    try {
      const result = await this.service.createApplicant(userId);
      return reply
        .code(CODE.CREATED)
        .send(response.created({ data: result }));
    } catch (err) {
      return reply
        .code(CODE.INTERNAL_SERVER_ERROR)
        .send(response.internalServerError(err));
    }
  }


  async getKycStatus(userId: string, reply: FastifyReply) {
        try {
            const status = await this.getKycStatusService.getKycStatus(userId);
            return reply.code(CODE.OK).send(response.ok({ data: status }));
        } catch (err) {
            return reply
                .code(CODE.INTERNAL_SERVER_ERROR)
                .send(response.internalServerError(err));
        }
    }
}