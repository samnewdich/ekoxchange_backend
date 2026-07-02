import { authenticator } from "otplib";

export function verifyAuthenticatorCode(token: string, secret: string) {
    return authenticator.verify({token, secret});
}