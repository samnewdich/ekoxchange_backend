import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateApplicantService } from "../services/kyc/commands/createApplicant.service.js";
import { CODE } from "../constants/http.constant.js";
import { ResponseBuilder } from "../constants/reply.constant.js";
import type { User } from "../generated/mongodb/index.js";
const response = new ResponseBuilder();

export class KycController{
    constructor(
        private readonly createApplicantService = new CreateApplicantService()
    ){}

    async createApplicant(request:User, reply:FastifyReply){
        const user = request;
        const result = await this.createApplicantService.createApplicant(user);
        return reply
            .code(CODE.CREATED)
            .send(response.created(
                {
                    data:result
                }
            ));
    }
}