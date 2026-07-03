import { sumsubRequest } from "./sumsub.config.js";

export interface AccessTokenInput {
  userId: string;
  applicantId: string;
  levelName?: string;
  ttlInSecs?: number;
}

export async function createAccessTokenApi(data: AccessTokenInput) {
  return sumsubRequest("POST", "/resources/accessTokens/sdk", {
    userId: data.userId,
    applicantId: data.applicantId,
    levelName: data.levelName ?? "basic-kyc-level",
    ttlInSecs: data.ttlInSecs ?? 3600,
  });
}