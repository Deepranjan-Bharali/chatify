import express from 'express';
import { signup,login,logout,updateProfile } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';
import arcjet from '@arcjet/node';
const router = express.Router();    

router.use(arcjetProtection); // Apply Arcjet protection to all routes in this router   

router.post("/signup", signup); 
router.post("/login", login); 
router.post("/logout", logout); 

router.put("/update-profile",protectRoute, updateProfile);

router.get("/check", protectRoute, (req, res) => {
    res.status(200).json({ message: "You are authenticated", user: req.user });
});
export default router;