import jswt from 'jsonwebtoken';
import {ENV} from "./env.js";

export const generateToken = (userId,res) => {
    const {JWT_SECRET} = ENV;
    if(!JWT_SECRET){
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const token = jswt.sign({userId },
        JWT_SECRET, { expiresIn: '7d' });
    
    // token sending back to client in cookie
    res.cookie("jwt", token, {
        httpOnly: true, // prevent XSS attacks:cross-site scripting
        secure: ENV.NODE_ENV === "development"? false:true,
        sameSite: "strict", //CSRF attack prevention:cross-site request forgery
        maxAge: 7*24 * 60 * 60 * 1000 // 7 day
    });
    return token;
}