import { z } from "zod";

export const appleLoginDto = z.object({
    identityToken: z.string().min(1)
});

export type AppleLoginDto = z.infer<typeof appleLoginDto>;