import { createApplicantApi } from "../../../apis/sumsub/createApplicant.sumsub.api.js";
import { createAccessTokenApi } from "../../../apis/sumsub/createAccessToken.sumsub.api.js";
import { UserRepository } from "../../../repositories/user.repository.js";

const userRepository = new UserRepository();

export class CreateApplicantService {
    async createApplicant(userId: string) {
        // 1. Find the user BY ID (not by email)
        const user = await userRepository.findById(userId);
        if (!user) throw new Error("User not found");

        // 2. Reuse applicant if we already created one
        let applicantId: string;

        if (user.sumsubApplicantId) {
            applicantId = user.sumsubApplicantId;
        } else {
            const created = await createApplicantApi({
                userId: String(user.id),
                email: user.email,
                firstName: user.firstname ?? user.fullname?.split(" ")[0] ?? "",
                lastName:  user.lastname  ?? user.fullname?.split(" ").slice(1).join(" ") ?? "",
                // omit country/phone when null — don't send null to Sumsub
                ...(user.country ? { country: user.country } : {}),
                ...(user.phone   ? { phone:   user.phone   } : {}),
            });

            applicantId = created.id;

            await userRepository.updateApplicantId(user.id, {
                sumsubApplicantId: applicantId,
                kycStatus: "in_progress",
            });
        }

        // 3. Mint an SDK access token
        const token = await createAccessTokenApi({
            userId: String(user.id),
            applicantId,
            levelName: "basic-kyc-level",
            ttlInSecs: 3600,
        });

        return {
            applicantId,
            token: token.token,
            userId: token.userId,
        };
    }
}