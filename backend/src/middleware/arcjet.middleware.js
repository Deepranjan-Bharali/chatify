import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";


export const arcjetProtection = async (req, res, next) => {
    try{
        const decision = await aj.protect(req);

        if(decision.isDenied()){
            if(decision.reason.isRateLimit()){
                res.status(429).json({ message: "Rate limit exceeded. Please try again later." });
            }
            else if(decision.reason.isBot()){
                res.status(403).json({ message: "Access denied. Bots are not allowed." });
            }else{
                res.status(403).json({ message: "Access denied by security policy." });
            }
        }

        // check for spoofed bot
        if(decision.results.some(isSpoofedBot)){

        }

        next();
    }catch(error){
        console.log("Arcjet Protection error:", error);
        next();
    }
}