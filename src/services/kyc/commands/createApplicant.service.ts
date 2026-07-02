import { createApplicantApi } from "../../../apis/sumsub/createApplicant.sumsub.api.js";
import { UserRepository } from "../../../repositories/user.repository.js";
import type { User } from "../../../generated/mongodb/index.js";

export class CreateApplicantService{
    constructor(
        private readonly userRepository = new UserRepository()
    ){}

    async createApplicant(user:User){
        const existing = await this.userRepository.findApplicant(user.email);
        existing?.sumsubApplicantId
        if(existing?.sumsubApplicantId){
            return{
                applicantId:
                existing.sumsubApplicantId
            };
        }

        const applicant = await createApplicantApi({
            userId:user.id,
            email:user.email,
            firstname:user.firstname ?? "",
            lastname:user.lastname ?? ""
        });

        await this.userRepository.updateApplicantId(
            user.email,
            applicant.id
        );
        return {
            applicantId: applicant.id
        };
    }
}