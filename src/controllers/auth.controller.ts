import type { FastifyInstance, FastifyReply } from "fastify";
import type { RegisterDto } from "../dtos/register.dto.js";
import { RegisterService } from "../services/auth/commands/register.service.js";
import { CODE } from "../constants/http.constant.js";
import { ResponseBuilder } from "../constants/reply.constant.js";
import type { EmailVerifyDto } from "../dtos/emailverify.dto.js";
import type { LoginDto } from "../dtos/login.dto.js";
import { LoginService } from "../services/auth/queries/login.service.js";
import { GoogleLoginService } from "../services/auth/queries/google-login.service.js";
import type { GoogleLoginDto } from "../dtos/google-login.dto.js";
import type { AppleLoginDto } from "../dtos/apple-login.dto.js";
import { AppleLoginService } from "../services/auth/queries/apple-login.service.js";
import type { PasswordRecoveryDto } from "../dtos/password-recovery.dto.js";
import { PasswordRecoveryService } from "../services/auth/queries/password-recovery.service.js";
import type { PasswordResetDto } from "../dtos/password-reset.dto.js";
import type { AuthDto } from "../dtos/auth.dto.js";
import type { AuthVerifyDto } from "../dtos/authverify.dto.js";
import { AuthService } from "../services/auth/commands/auth.service.js";

const response = new ResponseBuilder();

export class AuthController {
    private readonly registerService = new RegisterService();
    private readonly loginService    = new LoginService();
    private readonly googleLoginService = new GoogleLoginService();
    private readonly appleLoginService = new AppleLoginService();
    private readonly passwordService = new PasswordRecoveryService();
    private readonly authService = new AuthService();

    async registerController(data: RegisterDto, reply: FastifyReply) {
        try {
            const userExists = await this.registerService.registerUser(data, reply);
            return userExists;

        } catch (err) {
            console.log(err);
            return reply
                .code(CODE.INTERNAL_SERVER_ERROR)
                .send(response.internalServerError(err));
        }
    }


    async emailVerification(data:EmailVerifyDto, reply: FastifyReply){
        try {
            const verifyIt = await this.registerService.verifyEmail(data.email, data.otp, reply);
            return verifyIt;
        } catch (error) {
            return reply
                .code(CODE.INTERNAL_SERVER_ERROR)
                .send(response.internalServerError(error));
        }
    }



    async loginController(data:LoginDto, reply: FastifyReply, app:FastifyInstance){
        try {
            const logit = await this.loginService.getUser(data, reply, app);
            return logit;
        } catch (error) {
            return reply
                .code(CODE.INTERNAL_SERVER_ERROR)
                .send(response.internalServerError(error));
        }
    }


    async googleLoginController(data:GoogleLoginDto, reply: FastifyReply, app:FastifyInstance){
        try {
            const logit = await this.googleLoginService.googleLoginService(data, reply, app);
            return logit;
        } catch (error) {
            return reply
                .code(CODE.INTERNAL_SERVER_ERROR)
                .send(response.internalServerError(error));
        }
    }



    async appleLoginController(data:AppleLoginDto, reply: FastifyReply, app:FastifyInstance){
        try {
            const logit = await this.appleLoginService.appleLoginService(data, reply, app);
            return logit;
        } catch (error) {
            return reply
                .code(CODE.INTERNAL_SERVER_ERROR)
                .send(response.internalServerError(error));
        }
    }




    async passRecoveryController(data:PasswordRecoveryDto, reply: FastifyReply){
        try {
            const logit = await this.passwordService.checkEmail(data, reply);
            return logit;
        } catch (error) {
            return reply
                .code(CODE.INTERNAL_SERVER_ERROR)
                .send(response.internalServerError(error));
        }
    }


    async passResetController(data:PasswordResetDto, reply: FastifyReply){
        try {
            const logit = await this.passwordService.checkOtp(data, reply);
            return logit;
        } catch (error) {
            return reply
                .code(CODE.INTERNAL_SERVER_ERROR)
                .send(response.internalServerError(error));
        }
    }




    async twoFa(data:AuthDto, reply: FastifyReply, app:FastifyInstance){
        try {
            const logit = await this.authService.twoFactorAuthentication(data, reply);
            return logit;
        } catch (error) {
            return reply
                .code(CODE.INTERNAL_SERVER_ERROR)
                .send(response.internalServerError(error));
        }
    }


    async twoFaVerify(data:AuthVerifyDto, reply: FastifyReply, app:FastifyInstance){
        try {
            const logit = await this.authService.verifyTwoFactorAuthentication(data, reply);
            return logit;
        } catch (error) {
            return reply
                .code(CODE.INTERNAL_SERVER_ERROR)
                .send(response.internalServerError(error));
        }
    }
}