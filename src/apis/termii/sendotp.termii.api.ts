import axios from "axios";
import { ansofraConfig } from "../../configs/env.config.js";
const config = ansofraConfig()();

/*
export async function sendOtpSms(phone: string, otp: string): Promise<void> {
    const body = {
        api_key: config.TERMII_API_KEY,
        to: phone,
        from: config.TERMII_API_NAME,
        sms: `Your Ekoxchange verification code is ${otp}. It expires in 10 minutes.`,
        type: "plain",
        channel: "generic"
    };

    const response = await axios.post(
        config.TERMII_BASE_URL + "/api/sms/send",
        body,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    console.log(response.data);
}
*/

export async function sendOtpSms(phone: string, otp: string): Promise<void> {
    try {
        const body = {
            api_key: config.TERMII_API_KEY,
            to: phone,
            from: config.TERMII_API_NAME,
            sms: `Your Ekoxchange verification code is ${otp}. It expires in 10 minutes.`,
            type: "plain",
            channel: "generic"
        };

        console.log(body);

        const response = await axios.post(
            `${config.TERMII_BASE_URL}/api/sms/send`,
            body,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(response.data);

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.log("STATUS:", error.response?.status);
            console.log("DATA:", error.response?.data);
        } else {
            console.log(error);
        }

        throw error;
    }
}



export async function sendSms(phone: string, message: string): Promise<void> {
    const body = {
        api_key: config.TERMII_API_KEY,
        to: phone,
        from: config.TERMII_API_NAME,
        sms: message,
        type: "plain",
        channel: "generic"
    };

    const response = await axios.post(
        config.TERMII_BASE_URL + "/api/sms/send",
        body,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );

    console.log(response.data);
}