import type { FastifyInstance, FastifyReply } from "fastify";
import type { LoginDto } from "../../../dtos/login.dto.js";
import { RegisterService } from "../commands/register.service.js";
import { UserRepository } from "../../../repositories/user.repository.js";
import { CODE } from "../../../constants/http.constant.js";
import { ResponseBuilder } from "../../../constants/reply.constant.js";
import { otpUtil} from "../../../utils/otp.util.js";
import bcrypt from 'bcrypt';
import { ROLE } from "../../../constants/role.constant.js";

const response          = new ResponseBuilder();
const userRepository    = new UserRepository();
const registerService   = new RegisterService();
const nownow            = Math.floor(Date.now() / 1000);

export class LoginService{
    async getUser(data:LoginDto, reply:FastifyReply, app:FastifyInstance){
        const user = await userRepository.findByEmail(data.email);
        if(!user){
            return reply
                .code(CODE.BAD_REQUEST)
                .send(response.badRequest());
        }

        const passw  = user.password;
        const device = user.deviceID;

        if (passw === null || device === null) {
            return reply
                .code(CODE.BAD_REQUEST)
                .send(response.badRequest());
        }

        const otp    = otpUtil(nownow.toString() + data.email);

        //check password match
        const checkpwd = await bcrypt.compare(data.password, passw);
        if(!checkpwd){
            return reply
                .code(CODE.NOT_FOUND)
                .send(response.notFound('incorrect password'));
        }

        if(passw === null || device === null){
            return reply
                .code(CODE.BAD_REQUEST)
                .send(response.badRequest())
        }

        if(data.deviceID !== device){
            //send verification otps
            await registerService.otpSenderEmail(data.email, otp);
            if(user.phone !==null){
                await registerService.otpSenderPhone(user.phone, otp);
            }

            await registerService.otpTime(data.email, otp, nownow);

            return reply
                .code(CODE.OK)
                .send(response.ok({
                    message:'A new device was detected, verification code was sent to your Email and Phone',
                    email:data.email,
                    phone: user.phone,
                    isAuthenticatorEnabled: user.isAuthenticatorEnabled
                }));
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