import express from 'express';
import { signup } from '../controllers/auth.controller.js';
const router = express.Router();    

router.get("/login", (req, res) => {
  res.send("Login route");
}); 
router.get("/logout", (req, res) => {
  res.send("Logout route");
}); 
router.post("/signup", signup); 
export default router;