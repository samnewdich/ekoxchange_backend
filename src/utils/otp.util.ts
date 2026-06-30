import { createHash } from "crypto";
import { sendOtpSms, sendSms } from "../apis/termii/sendotp.termii.api.js";
import { sendEmailMailersend } from "../apis/mailersend/send.mailersend.api.js";

/*export function otpUtil(value: string): string {
    return randomInt(100000, 1000000).toString();
    const hash = createHash("sha256")
        .update(value)
        .digest("hex");

    // Convert each hex character to its ASCII code and keep only digits
    return hash
        .split("")
        .map(char => char.charCodeAt(0))
        .join("")
        .replace(/\D/g, "");
}
*/

export function otpUtil(value: string): string {
    const hash = createHash("sha256")
        .update(value)
        .digest("hex");

    const number = BigInt("0x" + hash);

    return (number % 1000000n)
        .toString()
        .padStart(6, "0");
}


export async function sendOtpEmail(email:string, otp:string): Promise<void>{
    //logic to send otp via email
    const subject ="OTP Verification";
    await sendEmailMailersend(email, subject, otp, otp);
}


export async function sendOtpPhone(phone:string, otp:string): Promise<void>{
    //logic to send otp via phone
    await sendOtpSms(phone, otp);
}



export async function sendEmail(email:string, name:string, message:string) {
    const subject="";
    await sendEmailMailersend(email, subject, message, message);
}


export async function sendPhone(phone:string, name:string, message:string) {
    sendSms(phone, message);
}