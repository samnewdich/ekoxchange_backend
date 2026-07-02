import {z} from 'zod';

export const authVeifyDto = z.object({
    email:z.email(),
    token:z.string().min(6).max(6)
});

export type AuthVerifyDto = z.infer<typeof authVeifyDto>;
