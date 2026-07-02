import {z} from 'zod';

export const authDto = z.object({
    email:z.email('Email is invalid')
});

export type AuthDto = z.infer<typeof authDto>;
