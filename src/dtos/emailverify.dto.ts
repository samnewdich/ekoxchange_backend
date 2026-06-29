import {email, z} from 'zod';

export const emailVerifyDto = z.object({
    email:z.email('Email is invalid'),
    otp: z.string(),
});

export type EmailVerifyDto = z.infer<typeof emailVerifyDto>;
