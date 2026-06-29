import { OAuth2Client } from "google-auth-library";
import { ansofraConfig } from "../configs/env.config.js";

const GOOGLE_CLIENT_ID = ansofraConfig()().GOOGLE_CLIENT_ID!;

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken: string) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID
    });

    return ticket.getPayload();
}