import { verifyGoogleToken } from "../../../utils/google.util.js";
import { UserRepository } from "../../../repositories/user.repository.js";
import type { GoogleLoginDto } from "../../../dtos/google-login.dto.js";
import type { FastifyInstance, FastifyReply } from "fastify";
import { CODE } from "../../../constants/http.constant.js";
import { ResponseBuilder } from "../../../constants/reply.constant.js";
import { ROLE } from "../../../constants/role.constant.js";

const response = new ResponseBuilder();
const userRepository = new UserRepository();

export class GoogleLoginService{
    async googleLoginService(data: GoogleLoginDto, reply:FastifyReply, app:FastifyInstance){
        const payload = await verifyGoogleToken(data.idToken);
        if (!payload) {
            throw new Error("Invalid Google token");
        }

        let user = await userRepository.findByEmail(payload.email!);

        if (!user) {
            user = await userRepository.createGoogleUser({
                email: payload.email!,
                fullname: payload.name ?? "",
                firstname: payload.given_name ?? "",
                lastname: payload.family_name ?? ""
            });
        }

        const token = await app.jwt.sign({
            id: user.id,
            email: user.email,
            username: user.username,
            role:ROLE.USER
        });

        return reply
            .code(CODE.OK)
            .send(response.ok({
                token,
                user
            }));
    }
}