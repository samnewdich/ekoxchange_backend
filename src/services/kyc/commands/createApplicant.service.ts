import { createApplicantApi } from "../../../apis/sumsub/createApplicant.sumsub.api.js";
import { createAccessTokenApi } from "../../../apis/sumsub/createAccessToken.sumsub.api.js";
import { UserRepository } from "../../../repositories/user.repository.js";
import type { User } from "../../../generated/mongodb/index.js";
const userRepository = new UserRepository();

export class CreateApplicantService {
  async createApplicant(email: string) {
    // 1. Find the user (Mongoose)
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("User not found");

    // 2. Reuse applicant if we already created one
    let applicantId: string;
    if (user.sumsubApplicantId) {
      applicantId = user.sumsubApplicantId;
    } else {
      const applicant = await createApplicantApi({
        userId: String(user.email),
        email: user.email,
        firstName: user.firstname ?? user.fullname?.split(" ")[0] ?? "",
        lastName:  user.lastname  ?? user.fullname?.split(" ").slice(1).join(" ") ?? "",
        country: user.country!,
        phone: user.phone!,
      });
      applicantId = applicant.id;
      await userRepository.updateApplicantId(user.email, 
        { sumsubApplicantId: applicantId, kycStatus: "in_progress" }
      );
    }

    // 3. Mint an SDK access token
    const token = await createAccessTokenApi({
      userId: String(user.email),
      applicantId,
    });

    return {
      applicantId,
      token: token.token,        // give this to the Sumsub Web/Mobile SDK
      userId: token.userId,
    };
  }
}