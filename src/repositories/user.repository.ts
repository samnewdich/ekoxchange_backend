import {mongo} from "../prisma/index.js";
import type { RegisterDto } from "../dtos/register.dto.js";

export class UserRepository{
    async findByEmail(email:string){
        return mongo.user.findUnique(
            {
                where:{
                    email:email
                }
            }
        );
    }
    
    async create(data: RegisterDto) {
        return mongo.user.create({
            data: {
                email: data.email,
                fullname: data.fullname,
                firstname: data.firstname,
                lastname: data.lastname,
                username: data.username,
                password: data.password,
                phone: data.phone,
                country: data.country,
                timeZone: data.timeZone,
                referralCode: data.referralCode ?? null,
                deviceID: data.device.deviceID,
                latitude: data.device.latitude,
                longitude: data.device.longitude,
                locationName: data.device.locationName,
                deviceName: data.device.deviceName,
                otp: data.otp ?? null
            }
        });

    }

    async updateOtp(email:string, otp:string, timeCreated:number){
        return mongo.user.update(
            {
                where:{
                    email:email
                },

                data:{
                    otp:otp,
                    otpCreatedTime:timeCreated
                }
            }
        );
    }


    async verifyEmail(email:string){
        return mongo.user.findUnique({
            where:{
                email:email
            }
        });
    }

    async updateOtpVerified(email:string, currenttime:number){
        return mongo.user.update({
            where:{
                email:email
            },
            data:{
                isEmailVerified:true,
            }
        });
    }




    async createGoogleUser(data: {email: string; fullname: string; firstname: string; lastname: string;}) {
        return mongo.user.create({
            data: {
                email: data.email,
                fullname: data.fullname,
                firstname: data.firstname,
                lastname: data.lastname,

                username: `user_${crypto.randomUUID().slice(0, 8)}`,

                password: null,

                phone: null,

                country: null,

                timeZone: null,

                deviceID: null,

                latitude: null,

                longitude: null,

                locationName: null,

                deviceName: null,

                isEmailVerified: true
            }
        });
    }



    async createAppleUser(data: {email: string; providerId: string}) {
        return mongo.user.create({
            data: {
                email: data.email,
                providerId: data.providerId,
                fullname: null,
                firstname: null,
                lastname: null,

                username: `user_${crypto.randomUUID().slice(0, 8)}`,

                password: null,

                phone: null,

                country: null,

                timeZone: null,

                deviceID: null,

                latitude: null,

                longitude: null,

                locationName: null,

                deviceName: null,

                isEmailVerified: true
            }
        });
    }



    async validateOtp(email:string, otp:string){
        return mongo.user.findFirst({
            where:{
                email:email,
                otp:otp
            }
        });
    }


    async passwordReset(email:string, password:string){
        return mongo.user.update({
            where:{
                email:email
            },
            data:{
                password:password
            }
        });
    }


    async findById(userId: string) {
        return mongo.user.findUnique({
            where: { id: userId },
        });
    }


    async updateAuthenticatorSecret(email:string, secret:string){
        return mongo.user.update({
            where:{
                email:email
            },
            data:{
                authenticatorSecret:secret
            }
        });
    }
    

    async updateApplicantId(userId: string, data: { sumsubApplicantId: string; kycStatus: string }) {
        return mongo.user.update({
            where: { id: userId },
            data: {
                sumsubApplicantId: data.sumsubApplicantId,
                kycStatus: data.kycStatus,
            },
        });
    }

    async findApplicant(userId: string): Promise<{ sumsubApplicantId: string | null } | null> {
        const user = await mongo.user.findUnique({
            where: { id: userId },
            select: { sumsubApplicantId: true },
        });
        return user; // null if user not found, otherwise { sumsubApplicantId }
    }



    async updateKycResult(userId: string, data: {kycStatus: string; isKycVerified: boolean; kycReviewAnswer: string | null; kycRejectedReason: string | null; kycCompletedAt: Date;}) {
        return mongo.user.update({
            where: { id: userId },
            data,
        });
    }
    
}