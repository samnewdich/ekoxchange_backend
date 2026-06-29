import mongoose from "mongoose";
import { ansofraConfig } from "../configs/env.config.js";

export const connectDB = async () => {
    await mongoose.connect(`${ansofraConfig()().MONGODB_URL}`);
    console.log('Mongodb connected');
};