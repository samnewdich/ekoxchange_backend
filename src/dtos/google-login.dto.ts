import { z } from "zod";

export const googleLoginDto = z.object({
    idToken: z.string().min(1)
});

export type GoogleLoginDto = z.infer<typeof googleLoginDto>;