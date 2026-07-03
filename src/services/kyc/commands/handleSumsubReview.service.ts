import { sumsubRequest } from "../../../apis/sumsub/sumsub.config.js";
import { UserRepository } from "../../../repositories/user.repository.js";

const userRepository = new UserRepository();

export class HandleSumsubReviewService {
    /**
     * Pulls the latest applicant status from Sumsub (source of truth)
     * and updates the user's record in our DB.
     */
    async handleReview(applicantId: string, externalUserId: string) {
        // 1. Ask Sumsub for the current state
        const data = await sumsubRequest(
            "GET",
            `/resources/applicants/${applicantId}/status`
        );

        const reviewAnswer = data.review?.reviewAnswer as "GREEN" | "RED" | undefined;
        const rejectLabels: string[] = data.review?.rejectLabels ?? [];

        const isApproved = reviewAnswer === "GREEN";
        const kycStatus  = isApproved ? "approved" : "rejected";

        // 2. Update the user
        await userRepository.updateKycResult(externalUserId, {
            kycStatus,
            isKycVerified: isApproved,
            kycReviewAnswer: reviewAnswer ?? null,
            kycRejectedReason: isApproved ? null : rejectLabels.join(", "),
            kycCompletedAt: new Date(),
        });
    }
}