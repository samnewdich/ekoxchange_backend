import crypto from "crypto";
import { ansofraConfig } from "../../configs/env.config.js";

const config = ansofraConfig()();

const APP_TOKEN  = config.SUMSUB_APP_TOKEN!;
const SECRET_KEY = config.SUMSUB_SECRET_KEY!;
const BASE_URL   = config.SUMSUB_BASE_URL!;   // e.g. https://api.sumsub.com

export async function sumsubRequest(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  endpoint: string,
  body?: unknown
): Promise<any> {
  const ts = Math.floor(Date.now() / 1000).toString();
  const payload = body ? JSON.stringify(body) : "";
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(ts + method + endpoint + payload)
    .digest("hex");

  const response = await fetch(BASE_URL + endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-App-Token": APP_TOKEN,
      "X-App-Access-Ts": ts,
      "X-App-Access-Sig": signature,
    },
    body: body ? payload : null,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Sumsub ${method} ${endpoint} failed (${response.status}): ${text}`);
  }

  return response.json();
}