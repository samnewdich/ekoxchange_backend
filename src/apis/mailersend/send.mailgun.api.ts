import { ansofraConfig } from "../../configs/env.config.js";
const config = ansofraConfig()();

export async function sendMailEmailgun(
    to: string,
    subject: string,
    text: string,
    html: string
) {
    const domain = config.MAILGUN_DOMAIN!;
    const apiKey = config.MAILGUN_API_KEY!;
    const from = config.MAILGUN_FROM_NAME!;

    const body = new URLSearchParams({
        from,
        to,
        subject,
        text,
        html,
    });

    const response = await fetch(
        `${config.MAILGUN_BASE_URL}/${domain}/messages`,
        {
            method: "POST",
            headers: {
                Authorization:
                    "Basic " +
                    Buffer.from(`api:${apiKey}`).toString("base64"),
                "Content-Type":
                    "application/x-www-form-urlencoded",
            },
            body,
        }
    );

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}