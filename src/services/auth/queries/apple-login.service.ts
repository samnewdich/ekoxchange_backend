import { verifyAppleToken } from "../../../utils/apple.util.js";
import { UserRepository } from "../../../repositories/user.repository.js";
import type { AppleLoginDto } from "../../../dtos/apple-login.dto.js";
import type { FastifyInstance, FastifyReply } from "fastify";
import { CODE } from "../../../constants/http.constant.js";
import { ResponseBuilder } from "../../../constants/reply.constant.js";
import { ROLE } from "../../../constants/role.constant.js";

const response = new ResponseBuilder();
const userRepository = new UserRepository();

export class AppleLoginService{
    async appleLoginService(data: AppleLoginDto, reply:FastifyReply, app:FastifyInstance){
        const payload = await verifyAppleToken(data.identityToken);
        if (!payload) {
            throw new Error("Invalid Apple token");
        }

        let user = await userRepository.findByEmail(payload.email);

        if (!user) {
            user = await userRepository.createAppleUser({
                email: payload.email,
                providerId: payload.sub
            });
        }

        const token = await app.jwt.sign({
            id: user.id,
            email: user.email,
            role: ROLE.USER
        });

        return reply
            .code(CODE.OK)
            .send(response.ok({
                token,
                user
            }));
    }
}