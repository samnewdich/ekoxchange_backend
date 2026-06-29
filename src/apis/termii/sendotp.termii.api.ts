import axios from "axios";
import { ansofraConfig } from "../../configs/env.config.js";
const config = ansofraConfig()();

export async function sendOtpSms(phone: string, otp: string): Promise<void> {
    const body = {
        api_key: config.TERMII_API_KEY!,
        to: phone,
        from: config.TERMII_SENDER_ID!,
        sms: `Your Ansofra verification code is ${otp}. It expires in 10 minutes.`,
        type: "plain",
        channel: "generic"
    };

    const response = await axios.post(
        config.TERMII_BASE_URL! + "/api/sms/send",
        body,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    console.log(response.data);
}



export async function sendSms(phone: string, message: string): Promise<void> {
    const body = {
        api_key: config.TERMII_API_KEY!,
        to: phone,
        from: config.TERMII_SENDER_ID!,
        sms: message,
        type: "plain",
        channel: "generic"
    };

    const response = await axios.post(
        config.TERMII_BASE_URL! + "/api/sms/send",
        body,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    console.log(response.data);
}