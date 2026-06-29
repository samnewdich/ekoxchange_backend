import {z} from 'zod';

export const passwordResetDto = z.object({
    email: z.email(),
    password: z.string().min(8),
    otp: z.string()
});

export type PasswordResetDto = z.infer<typeof passwordResetDto>;