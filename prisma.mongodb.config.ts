import { defineConfig } from "prisma/config";

export default defineConfig({
    schema: "prisma/mongodb.schema.prisma",
});

/*
import dotenv from 'dotenv';
import { defineConfig } from "prisma/config";
dotenv.config();

export default defineConfig({
    schema: "prisma/mongodb.schema.prisma",

    datasource: {
        url: process.env.MONGODB_PRISMA_URL!,
    },
});
*/