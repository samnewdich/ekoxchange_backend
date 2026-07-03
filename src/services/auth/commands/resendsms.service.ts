import type { FastifyInstance, FastifyReply } from "fastify";
import type { LoginDto } from "../../../dtos/login.dto.js";
import { RegisterService } from "../commands/register.service.js";
import { UserRepository } from "../../../repositories/user.repository.js";
import { CODE } from "../../../constants/http.constant.js";
import { ResponseBuilder } from "../../../constants/reply.constant.js";
import { otpUtil} from "../../../utils/otp.util.js";
import type { SendSmsDto } from "../../../dtos/send-sms.dto.js";

const response          = new ResponseBuilder();
const userRepository    = new UserRepository();
const registerService   = new RegisterService();
const nownow            = Math.floor(Date.now() / 1000);
    
export class ResendSmsService{
    async sendSms(data:SendSmsDto, reply:FastifyReply){
        const user = await userRepository.findByEmail(data.email);
        if(!user){
            return reply
                .code(CODE.BAD_REQUEST)
                .send(response.badRequest());
        }

        const otp    = otpUtil(nownow.toString() + data.email);


        if(otp === null || user.phone === null){
            //update db
            const dbup = await registerService.otpTime(data.email, otp, nownow);
            if(!dbup){
                return reply
                    .code(CODE.INTERNAL_SERVER_ERROR)
                    .send(response.internalServerError('Failed to update OTP in database'));
            }

            await registerService.otpSenderPhone(user.phone!, otp);

            return reply
                .code(CODE.OK)
                .send(response.ok({
                    message:'OTP sent to your phone ' + user.phone,
                    phone: user.phone
                }));
        }
    }
}