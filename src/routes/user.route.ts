import type { FastifyInstance } from "fastify";
import { ansofraConfig } from "../configs/env.config.js";

export async function userRoute(app:FastifyInstance) {
    const urlprefix: string = `${ansofraConfig()().APP_BASE_URL}${ansofraConfig()().APP_VERSION}`;
    app.post(urlprefix+'/profile', async ()=>{

    });

    app.post(urlprefix+'/profile/update', async() =>{

    });

    app.post(urlprefix+'/kyc', async ()=>{

    });

    app.post(urlprefix+'/reserved', async ()=>{

    });
}