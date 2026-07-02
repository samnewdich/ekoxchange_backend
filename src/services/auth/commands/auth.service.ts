import type { FastifyReply } from "fastify";
import { ResponseBuilder } from "../../../constants/reply.constant.js";
import { CODE } from "../../../constants/http.constant.js";
import type { AuthDto } from "../../../dtos/auth.dto.js";
import type { AuthVerifyDto } from "../../../dtos/authverify.dto.js";
import { UserRepository } from "../../../repositories/user.repository.js";
import { generateAuthenticatorSecret } from "../../../utils/authsecret.util.js";
import { verifyAuthenticatorCode } from "../../../utils/authverify.util.js";
import { generateQRCode } from "../../../utils/qrcode.util.js";

const userRepository = new UserRepository();

const response = new ResponseBuilder();

export class AuthService {
    async twoFactorAuthentication(data: AuthDto, reply: FastifyReply) {
        try {
            const user = await userRepository.findByEmail(data.email);
            if (!user) {
                return reply
                    .code(CODE.NOT_FOUND)
                    .send(response.notFound({ message: "User not found." }));
            }

            const {secret, otpauth} = generateAuthenticatorSecret(data.email);
            if(!secret || !otpauth){
                return reply
                    .code(CODE.INTERNAL_SERVER_ERROR)
                    .send(response.internalServerError({ message: "Failed to generate authenticator secret." }));
            }

            console.log(otpauth, "otpauth");

            //generate the qrcode for the user to scan
            const qrCode = await generateQRCode(otpauth);
            if(!qrCode){
                return reply
                    .code(CODE.INTERNAL_SERVER_ERROR)
                    .send(response.internalServerError({ message: "Failed to generate QR code." }));
            }
            
            const updatAuth = await userRepository.updateAuthenticatorSecret(data.email, secret);
            if(!updatAuth){
                return reply
                    .code(CODE.INTERNAL_SERVER_ERROR)
                    .send(response.internalServerError(
                        { 
                            message: "Failed to update authenticator secret.",
                        }
                    ));
            }

            return reply
                .code(CODE.OK)
                .send(response.ok(
                    { 
                        message: "Two-factor authentication initiated.",
                        qrCode: qrCode,
                    }
                ));
        } catch (error) {
            console.log(error);
            return reply
                .code(CODE.INTERNAL_SERVER_ERROR)
                .send(response.internalServerError(error));
        }
    }

    async verifyTwoFactorAuthentication(data: AuthVerifyDto, reply: FastifyReply) {
        try {
            const user = await userRepository.findByEmail(data.email);
            if (!user) {
                return reply
                    .code(CODE.NOT_FOUND)
                    .send(response.notFound({ message: "User not found." }));
            }

            const isValid = verifyAuthenticatorCode(data.token, user.authenticatorSecret!);
            if (!isValid) {
                return reply
                    .code(CODE.UNAUTHORIZED)
                    .send(response.unauthorized({ message: "Invalid two-factor authentication code." }));
            }

            return reply
                .code(CODE.OK)
                .send(response.ok({ message: "Two-factor authentication verified." }));
        } catch (error) {
            console.log(error);
            return reply
                .code(CODE.INTERNAL_SERVER_ERROR)
                .send(response.internalServerError(error));
        }
    }
}