import { UserRepository } from "../../../repositories/user.repository.js";

const userRepository = new UserRepository();

export class GetKycStatusService {
    async getKycStatus(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user) throw new Error("User not found");

        return {
            kycStatus:        user.kycStatus        ?? "pending",
            isKycVerified:    user.isKycVerified    ?? false,
            kycReviewAnswer:  user.kycReviewAnswer  ?? null,
            kycRejectedReason: user.kycRejectedReason ?? null,
            kycCompletedAt:   user.kycCompletedAt   ?? null,
        };
    }
}