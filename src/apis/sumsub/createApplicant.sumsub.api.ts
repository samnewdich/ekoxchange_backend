import { createAccessToken } from "./sumsub.request.js";
import { sumsubRequest } from "./createAccessToken.sumsub.api.js";

export async function createApplicantApi(data:{userId:string; email:string; firstname:string; lastname:string;}){
    return sumsubRequest(
        "POST",
        "/resources/applicants?levelName=basic-kyc-level",
        {
            externalUserId:data.userId,
            email:data.email,
            fixedInfo:{
                firstName:data.firstname,
                lastName:data.lastname
            }
        }
    );
}