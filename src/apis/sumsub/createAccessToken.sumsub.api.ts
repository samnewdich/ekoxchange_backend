import crypto from "crypto";
import { ansofraConfig } from "../../configs/env.config.js";
const config = ansofraConfig()();

const APP_TOKEN = config.SUMSUB_APP_TOKEN!;
const SECRET_KEY = config.SUMSUB_SECRET_KEY!;
const BASE_URL = config.SUMSUB_BASE_URL!;

export async function sumsubRequest(method: string, endpoint: string, body?: unknown) {
    const ts = Math.floor(Date.now() / 1000).toString();
    const payload = body ? JSON.stringify(body) : "";
    const signature = crypto
        .createHmac("sha256", SECRET_KEY)
        .update(ts + method.toUpperCase() + endpoint + payload)
        .digest("hex");

    const response = await fetch(BASE_URL + endpoint, {
        method: method.toUpperCase(),
        headers: {
            "Content-Type": "application/json",
            "X-App-Token": APP_TOKEN,
            "X-App-Access-Ts": ts,
            "X-App-Access-Sig": signature
        },
        body: body ? payload : null
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}