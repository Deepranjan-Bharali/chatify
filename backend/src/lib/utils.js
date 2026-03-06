import jswt from 'jsonwebtoken';

export const generateToken = (userId,res) => {
    const {JWT_SECRET} = process.env;
    if(!JWT_SECRET){
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const token = jswt.sign({userId },
        JWT_SECRET, { expiresIn: '7d' });
    
    // token sending back to client in cookie
    res.cookie("jwt", token, {
        httpOnly: true, // prevent XSS attacks:cross-site scripting
        secure: process.env.NODE_ENV === "development"? false:true,
        sameSite: "strict", //CSRF attack prevention:cross-site request forgery
        maxAge: 7*24 * 60 * 60 * 1000 // 7 day
    });
    return token;
}