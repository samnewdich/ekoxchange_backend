import crypto from "crypto";
import { ansofraConfig } from "../configs/env.config.js";
import { HandleSumsubReviewService } from "../services/kyc/commands/handleSumsubReview.service.js";

const config = ansofraConfig()();
const WEBHOOK_SECRET = config.SUMSUB_WEBHOOK_SECRET!;
const reviewService = new HandleSumsubReviewService();

export async function handleSumsubWebhook(rawBody: Buffer, headers: Record<string, string | undefined>): Promise<{ status: "ok" }> {
    // 1. Verify the signature Sumsub sends
    const alg       = headers["x-payload-digest-alg"] ?? "HMAC_SHA256_HEX";
    const signature = headers["x-payload-digest"] ?? "";

    if (alg !== "HMAC_SHA256_HEX") {
        throw new Error(`Unsupported digest alg: ${alg}`);
    }

    const expected = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

    // timing-safe compare to prevent timing attacks
    const sigA = Buffer.from(signature, "hex");
    const sigB = Buffer.from(expected, "hex");
    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
        throw new Error("Invalid Sumsub webhook signature");
    }

    // 2. Parse the event
    const event = JSON.parse(rawBody.toString("utf8")) as {
        applicantId: string;
        externalUserId: string;
        type: string;                    // e.g. "applicantReviewed"
    };

    // 3. Only act on the events we care about
    if (event.type === "applicantReviewed" || event.type === "applicantCreated") {
        await reviewService.handleReview(event.applicantId, event.externalUserId);
    }

    return { status: "ok" };
}