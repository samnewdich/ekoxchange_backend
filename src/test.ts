import { mongo } from "./prisma/index.js";

async function test() {
    await mongo.$connect();
    console.log("✅ MongoDB connected!");
    await mongo.$disconnect();
}

test().catch(console.error);