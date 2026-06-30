import type { RegisterDto } from "../../../dtos/register.dto.js";
import { UserRepository } from "../../../repositories/user.repository.js";
import { passwordUtil } from "../../../utils/password.util.js";
import { otpUtil, sendOtpEmail, sendOtpPhone } from "../../../utils/otp.util.js";
import { CODE } from "../../../constants/http.constant.js";
import { ResponseBuilder } from "../../../constants/reply.constant.js";
import type { FastifyReply } from "fastify";
import { APP } from "../../../constants/app.constant.js";

const userRepository    = new UserRepository();
const response          = new ResponseBuilder();

export class RegisterService {

    async registerUser(data:RegisterDto, reply:FastifyReply){
        try {
                const userExists = await this.checkUser(data);
                if (userExists) {
                    return reply
                        .code(CODE.CONFLICT)
                        .send(response.conflict());
                }
                
                const nownow  = Math.floor(Date.now() / 1000);
                const newUSer = await this.addUser(data, nownow);
                if(newUSer){
                    return reply
                        .code(CODE.CREATED)
                        .send(response.created({
                            email:data.email,
                            otpCreatedTimeInUnixTimestamp: nownow,
                            otpResendTimeFrame: APP.OTP_RESEND_TIME
                        }));
                }
                else{
                    return reply
                        .code(CODE.BAD_REQUEST)
                        .send(response.badRequest());
                }
            
        } catch (error) {
            console.log(error);
            return reply
                .code(CODE.INTERNAL_SERVER_ERROR)
                .send(response.internalServerError(error));
        }
    }

    async checkUser(data: RegisterDto): Promise<boolean> {
        const user = await userRepository.findByEmail(data.email);
        return user !== null;
    }

    async addUser(data: RegisterDto, nownow: number): Promise<boolean> {
        const hashedPassword    = await passwordUtil(data.password);
        const otp               = otpUtil(nownow.toString() + data.email);
        const newCreate         = await userRepository.create({...data, password: hashedPassword, otp: otp});
        if(newCreate){
            //update otp
            const otpResponse = await this.otpTime(data.email, otp, nownow);
            if(otpResponse){
                //then send otp
                //await this.otpSenderEmail(data.email, otp);
                //await this.otpSenderPhone(data.phone, otp);
            }

            return true;
        }

        return false;
    }


    async otpSenderEmail(email:string, otp:string): Promise<void>{
        await sendOtpEmail(email, otp);
    }

    async otpSenderPhone(phone:string, otp:string): Promise<void>{
        await sendOtpPhone(phone, otp);
    }

    async otpTime(email:string, otp:string, timeCreated:number): Promise<boolean>{
        const otper = await userRepository.updateOtp(email, otp, timeCreated);
        if(otper){
            return true;
        }

        return false;
    }


    async verifyEmail(email:string, otpin:string, reply: FastifyReply){
        const check = await userRepository.verifyEmail(email);
        if(!check){
            return reply
                .code(CODE.NOT_FOUND)
                .send(response.notFound(
                    {
                        email:email,
                        otp:otpin
                    }
                ));
        }

        const otpRetrieved              = check.otp;
        const otpCreatedTimeretrieved   = check.otpCreatedTime;
        if(otpRetrieved === null || otpCreatedTimeretrieved === null){
            return reply
                .code(CODE.BAD_REQUEST)
                .send(response.badRequest('No OTP has been generated'));
        }


        const expireduration            = APP.OTP_RESEND_TIME * 60;
        const expiredTime = otpCreatedTimeretrieved + expireduration;
        const currentTime = Math.floor(Date.now() / 1000);

        if(otpin === otpRetrieved && expiredTime >= currentTime){
            //now update the table
            const up = await userRepository.updateOtpVerified(email, currentTime);
            if(up){
                return reply
                    .code(CODE.OK)
                    .send(response.ok('Email verified successfully'));
            }

            return reply
                .code(CODE.BAD_REQUEST)
                .send(response.badRequest('Email verification failed'));
        }
        else if(otpin === otpRetrieved && expiredTime < currentTime){
            return reply
                .code(CODE.BAD_REQUEST)
                .send(response.badRequest('OTP has expired'));
        }
        else{
            return reply
                .code(CODE.NOT_FOUND)
                .send(response.notFound({
                    email:email,
                    otp:otpin
                }));
        }
    }
}