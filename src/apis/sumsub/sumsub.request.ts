import { sumsubRequest } from "./createAccessToken.sumsub.api.js";
export async function createAccessToken(userId: string, applicantId: string) {

    return sumsubRequest(
        "POST",
        `/resources/accessTokens/sdk`,
        {
            userId,
            applicantId,
            levelName: "basic-kyc-level",
            ttlInSecs: 3600
        }
    );
}