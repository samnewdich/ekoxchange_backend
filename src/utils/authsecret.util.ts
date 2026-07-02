import { authenticator } from "otplib";

export function generateAuthenticatorSecret(email: string) {
    const secret = authenticator.generateSecret();

    const otpauth = authenticator.keyuri(email, "EkoXchange", secret);

    return {secret, otpauth};
}