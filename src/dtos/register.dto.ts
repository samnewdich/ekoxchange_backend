import {z} from 'zod';

export const registerDto = z.object({
    email:z.email('Email is invalid'),
    fullname:z.string().min(4, 'Your fullname cannot be less than 4 characters'),
    firstname:z.string().min(2, 'firstname cannot be less than 2 characters'),
    lastname: z.string().min(2, 'lastname cannot be less than 2 characters'),
    country: z.string().min(2, "Country is required"),
    password: z.string().min(8, "Password must be at least 8 characters.").max(100),
    phone:z.string().min(7).max(20),
    device: z.object({
        deviceID: z.string(),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        locationName: z.string(),
        deviceName: z.string(),
    }),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores."),
    timeZone: z.string().min(1),
    referralCode: z.string().nullable().optional(),
    otp: z.string().nullable().optional(),
    otp_expire: z.string().nullable().optional()
});

export type RegisterDto = z.infer<typeof registerDto>;
