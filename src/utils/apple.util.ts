import appleSigninAuth from "apple-signin-auth";
import { ansofraConfig } from "../configs/env.config.js";

const APPLE_AUDIENCE = ansofraConfig()().APPLE_AUDIENCE!;

export async function verifyAppleToken(identityToken: string) {
    const payload = await appleSigninAuth.verifyIdToken(identityToken, {
        audience: APPLE_AUDIENCE
    });

    return payload;
}