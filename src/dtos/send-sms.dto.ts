import {z} from 'zod';

export const sendSmsDto = z.object({
    email: z.email()
});

export type SendSmsDto = z.infer<typeof sendSmsDto>;