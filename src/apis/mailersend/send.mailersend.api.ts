import { ansofraConfig } from "../../configs/env.config.js";
const config = ansofraConfig()();

export async function sendEmailMailersend(
    to: string,
    subject: string,
    html: string,
    text?: string
): Promise<boolean> {
    try {
        const response = await fetch(`${config.MAILERSEND_BASE_URL}/v1/email`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.MAILERSEND_API_KEY!}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: {
                    email: config.MAILERSEND_FROM_EMAIL!,
                    name: config.MAILERSEND_FROM_NAME!
                },

                to: [
                    {
                        email: to
                    }
                ],

                subject,

                html,

                text: text ?? ""
            })
        });

        if (!response.ok) {
            console.error(await response.text());
            return false;
        }

        return true;

    } catch (err) {
        console.error(err);
        return false;
    }
}