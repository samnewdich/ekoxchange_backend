import {z} from 'zod';

export const passwordRecoveryDto = z.object({
    email: z.email()
});

export type PasswordRecoveryDto = z.infer<typeof passwordRecoveryDto>;