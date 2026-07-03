import {z} from 'zod';

export const sendEmailDto = z.object({
    email: z.email()
});

export type SendEmailDto = z.infer<typeof sendEmailDto>;