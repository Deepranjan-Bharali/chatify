import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.js"
import bcrypt from "bcryptjs";
import {ENV} from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";


export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        // check if email valid: ragex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        // check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // create newUser
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });
        if (newUser) {

            const savedUser = await newUser.save();
            generateToken(savedUser._id, res);

            // send a welcome email to the user after successful signup
            try {
                const clientURL = ENV.CLIENT_URL || "http://localhost:5173";
                await sendWelcomeEmail(savedUser.email, savedUser.fullName, clientURL);
            } catch (error) {
                console.error("Error sending welcome email:", error);
            }

            res.status(201).json({
                _id: savedUser._id,
                fullName: savedUser.fullName,
                email: savedUser.email,
                profilePic: savedUser.profilePic
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error("Error in signup controller:", error);
        console.log("Error in signup controller:", error.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json({ message: "All fields are required" });
    }
    try{
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isPaasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPaasswordCorrect){
            return res.status(400).json({ message: "Invalid credentials" });
        }
        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        });
    }catch(error){
        console.error("Error in login controller:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const logout =  (req, res) => {
    
    res.clearCookie("jwt","",{maxAge:0} );
    res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
    try{
        const {profilePic} = req.body;
        if(!profilePic){
            return res.status(400).json({ message: "Profile picture is required" });
        }
        const userId = req.user._id;
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true }).select("-password");
        res.status(200).json({
            _id: updatedUser._id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            profilePic: updatedUser.profilePic
        });
    } catch (error) {
        console.error("Error in updateProfile controller:", error);
        res.status(500).json({ message: "Server error" });
    }   
}