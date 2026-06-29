import bcrypt from 'bcrypt';

export async function passwordUtil(data:string) : Promise<string>{
    const hashedPassword = await bcrypt.hash(data, 12);
    return hashedPassword;
}