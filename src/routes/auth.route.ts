import type { FastifyInstance } from "fastify";
import { ansofraConfig } from "../configs/env.config.js";
import { ansofraSanitize } from "../middlewares/body.middleware.js";
import { ansofraRateLimit } from "../middlewares/ratelimit.middleware.js";
import { AuthController } from "../controllers/auth.controller.js";
import type { RegisterDto } from "../dtos/register.dto.js";
import type { EmailVerifyDto } from "../dtos/emailverify.dto.js";
import type { LoginDto } from "../dtos/login.dto.js";
import type { GoogleLoginDto } from "../dtos/google-login.dto.js";
import type { AppleLoginDto } from "../dtos/apple-login.dto.js";
import type { PasswordRecoveryDto } from "../dtos/password-recovery.dto.js";
import type { PasswordResetDto } from "../dtos/password-reset.dto.js";
import type { AuthDto } from "../dtos/auth.dto.js";
import type { AuthVerifyDto } from "../dtos/authverify.dto.js";

export async function authRoute(app:FastifyInstance) {
    const urlprefix: string = `${ansofraConfig()().APP_BASE_URL}${ansofraConfig()().APP_VERSION}`;
    const authController = new AuthController();

    app.post<{Body:RegisterDto}>(
        urlprefix+'/register', 
        {
            ...ansofraRateLimit(5, "1 minute"),
            preHandler: ansofraSanitize
        }, 
        async (req, res)=>{
        //call controller
        return await authController.registerController(req.body, res);
    });

    app.post<{Body:EmailVerifyDto}>(
        urlprefix+'/verifyemail', 
        {
            ...ansofraRateLimit(5, "1 minute"),
            preHandler: ansofraSanitize
        }, 
        async (req, res)=>{
        //call controller
        return await authController.emailVerification(req.body, res);
    });

    
    

    //for login
    app.post<{Body:LoginDto}>(
        urlprefix+'/login', 
        {
            ...ansofraRateLimit(5, "1 minute"),
            preHandler: ansofraSanitize
        }, 
        async (req, res)=>{
        //call controller
        return await authController.loginController(req.body, res, app);
    });


    //for login with google
    app.post<{Body:GoogleLoginDto}>(
        urlprefix+'/google', 
        {
            ...ansofraRateLimit(5, "1 minute"),
            preHandler: ansofraSanitize
        }, 
        async (req, res)=>{
        //call controller
        return await authController.googleLoginController(req.body, res, app);
    });


    //for login with apple
    app.post<{Body:AppleLoginDto}>(
        urlprefix+'/apple', 
        {
            ...ansofraRateLimit(5, "1 minute"),
            preHandler: ansofraSanitize
        }, 
        async (req, res)=>{
        //call controller
        return await authController.appleLoginController(req.body, res, app);
    });




    //for password recovery
    app.post<{Body:PasswordRecoveryDto}>(
        urlprefix+'/passrecovery', 
        {
            ...ansofraRateLimit(5, "1 minute"),
            preHandler: ansofraSanitize
        }, 
        async (req, res)=>{
        //call controller
        return await authController.passRecoveryController(req.body, res);
    });



    //for password recovery
    app.post<{Body:PasswordResetDto}>(
        urlprefix+'/passreset', 
        {
            ...ansofraRateLimit(5, "1 minute"),
            preHandler: ansofraSanitize
        }, 
        async (req, res)=>{
        //call controller
        return await authController.passResetController(req.body, res);
    });





    //for authenticator creation
    app.post<{Body:AuthDto}>(
        urlprefix+'/2fa', 
        {
            ...ansofraRateLimit(5, "1 minute"),
            preHandler: ansofraSanitize
        }, 
        async (req, res)=>{
        //call controller
        return await authController.twoFa(req.body, res, app);
    });


    //for authenticator verification
    app.post<{Body:AuthVerifyDto}>(
        urlprefix+'/2fa/verify', 
        {
            ...ansofraRateLimit(5, "1 minute"),
            preHandler: ansofraSanitize
        }, 
        async (req, res)=>{
        //call controller
        return await authController.twoFaVerify(req.body, res, app);
    });
    
    
}