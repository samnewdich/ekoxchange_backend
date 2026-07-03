import crypto from "crypto";
import { ansofraConfig } from "../configs/env.config.js";
import { sumsubRequest } from "../apis/sumsub/sumsub.config.js";
import { KycStatus } from "../constants/kyc.constant.js";
import { CODE } from "../constants/http.constant.js";
import { ResponseBuilder } from "../constants/reply.constant.js";
const response = new ResponseBuilder();

const config = ansofraConfig()();
const WEBHOOK_SECRET = config.SUMSUB_WEBHOOK_SECRET!;

/**
 * Must be registered with content-type "application/json" raw body.
 * In Fastify: app.addContentTypeParser("application/json", { parseAs: "buffer" }, ...)
 */
export async function handleSumsubWebhook(
  rawBody: Buffer,
  headers: Record<string, string | undefined>
): Promise<{ status: "ok" }> {
  // 1. Verify signature
  const signature = headers["x-payload-digest-alg"]
    ? headers["x-payload-digest"] ?? ""
    : "";
  const alg = headers["x-payload-digest-alg"] ?? "HMAC_SHA256_HEX";

  if (alg !== "HMAC_SHA256_HEX") {
    throw new Error(`Unsupported digest alg: ${alg}`);
  }

  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (signature !== expected) {
    throw new Error("Invalid Sumsub webhook signature");
  }

  // 2. Parse and route on event type
  const event = JSON.parse(rawBody.toString("utf8")) as {
    applicantId: string;
    externalUserId: string;
    type: string;             // e.g. "applicantReviewed"
    reviewResult?: { reviewAnswer: "GREEN" | "RED"; rejectLabels?: string[] };
  };

  // 3. Pull final state from Sumsub (source of truth)
  const data = await sumsubRequest(
    "GET",
    `/resources/applicants/${event.applicantId}/status`
  );

  // 4. Update your DB here (Mongoose example)
  // const isVerified = data.review?.reviewAnswer === "GREEN";
  // await UserModel.updateOne(
  //   { _id: event.externalUserId },
  //   {
  //     $set: {
  //       kycStatus: isVerified ? "approved" : "rejected",
  //       isKycVerified: isVerified,
  //       kycReviewAnswer: data.review?.reviewAnswer,
  //       kycRejectedReason: data.review?.rejectLabels?.join(", "),
  //       kycCompletedAt: new Date(),
  //     },
  //   }
  // );

  return { status: "ok" };
}