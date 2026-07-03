import { sumsubRequest } from "./sumsub.config.js";

export interface CreateApplicantInput {
  userId: string;       // your external user id
  email: string;
  firstName: string;
  lastName: string;
  country?: string;     // ISO-3166-1 alpha-3, optional but recommended
  phone?: string;
}

export async function createApplicantApi(data: CreateApplicantInput) {
  return sumsubRequest(
    "POST",
    "/resources/applicants?levelName=basic-kyc-level",
    {
      externalUserId: data.userId,
      email: data.email,
      fixedInfo: {
        firstName: data.firstName,
        lastName: data.lastName,
        country: data.country,   // optional
      },
      phone: data.phone,         // optional
    }
  );
}