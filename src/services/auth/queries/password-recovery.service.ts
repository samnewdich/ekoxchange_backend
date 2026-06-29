import type { FastifyReply } from "fastify";
import type { PasswordRecoveryDto } from "../../../dtos/password-recovery.dto.js";
import { UserRepository } from "../../../repositories/user.repository.js";
import { CODE } from "../../../constants/http.constant.js";
import { ResponseBuilder } from "../../../constants/reply.constant.js";
import { RegisterService } from "../commands/register.service.js";
import { otpUtil, sendEmail, sendPhone } from "../../../utils/otp.util.js";
import type { PasswordResetDto } from "../../../dtos/password-reset.dto.js";
import { passwordUtil } from "../../../utils/password.util.js";

export class PasswordRecoveryService{
    private readonly userRepository = new UserRepository();
    private readonly response       = new ResponseBuilder();
    private readonly registerService = new RegisterService();

    async checkEmail(data:PasswordRecoveryDto, reply:FastifyReply){
        const check = await this.userRepository.findByEmail(data.email);
        if(!check){
            return reply
                .code(CODE.NOT_FOUND)
                .send(this.response.notFound('User not found'));
        }

        //generate otp and send
        const nownow   = Math.floor(Date.now() / 1000);
        const otp = await otpUtil(nownow.toString() + data.email);
        if(otp){
            const saveOtp = await this.registerService.otpTime(data.email, otp, nownow);
            if(saveOtp){
                //now send the otp
                await this.registerService.otpSenderEmail(data.email, otp);
                
                if(check.phone !==null){
                    await this.registerService.otpSenderPhone(check.phone, otp);
                }
            }
        }

        return reply
            .code(CODE.OK)
            .send(this.response.ok({
                message:"An OTP was sent to your Email" + data.email,
                email:data.email
            }));
    }



    async checkOtp(data:PasswordResetDto, reply:FastifyReply){
        const checko = await this.userRepository.validateOtp(data.email, data.otp);
        if(checko){
            await this.resetPassword(data.email, data.password, reply);
        }

        return reply
            .code(CODE.NOT_FOUND)
            .send(this.response.notFound('invalid email and otp mismatch'));
    }



    async resetPassword(email:string, pass:string, reply:FastifyReply){
        const newPasswordHashed = await passwordUtil(pass)
        const rset = await this.userRepository.passwordReset(email, newPasswordHashed);
        if(rset){
            //send mails and sms
            await this.sendMailAndSms(email, 'Password was recovered successfully');
            return reply
                .code(CODE.CREATED)
                .send(this.response.created('Password was changed successfully'));
        }

        return reply
            .code(CODE.BAD_REQUEST)
            .send(this.response.badRequest('Password reset failed'));
    }


    async sendMailAndSms(email:string, message:string){
        const user = await this.userRepository.findByEmail(email);
        if(user){
            await sendEmail(email, user.username, message);

            if(user.phone){
                await sendPhone(user.phone, user.username, message);
            }
        }
    }
}