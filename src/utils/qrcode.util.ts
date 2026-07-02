import QRCode from "qrcode";

export async function generateQRCode(otpauth: string) {
    return await QRCode.toDataURL(otpauth);
}