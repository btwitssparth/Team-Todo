import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken';
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { verifyJwt } from "../middlewares/Auth.js";
import mongoose from "mongoose";

const generateAccessandRefreshTokens= async(userId)=>{
    try {
        const user= await User.findById(userId)
        const accesstoken= user.generateAccessToken()
        const refreshtoken=user.generateRefreshToken()

        user.refreshtoken= refreshtoken
        await user.save({validateBeforeSave:false})

        return {accesstoken,refreshtoken}

    } catch (error) {
        console.log("error in generateaccessandrefresh in usercontroller",error)
        throw new ApiError(501,"something went wrong while generating tokens")
    }
}

const registeruser= asynchandler(async(req,res)=>{
    const {fullname,email,password}= req.body;

    // Check if all fields are provided
    if ([fullname,email,password].some((field)=>field?.trim()==="")) {
        throw new ApiError(400,"Please fill all the fields")
    }

    // Check if user already exists
    const existeduser= await User.findOne({
        $or:[{email}]
    });

    if (existeduser) {
        throw new ApiError(409,"User already exists")
    }

    // Check if avatar file is provided
    const avatarlocalpath= req.files?.avatar?.[0]?.path

    if(!avatarlocalpath){
        throw new ApiError(400,"Avatar is required")
    }

    // Upload to cloudinary
    const avatar= await uploadOnCloudinary(avatarlocalpath)

    if (!avatar) {
        throw new ApiError(500,"Error while uploading avatar to cloudinary")
    }

    // Create user
    const user= await User.create({
        fullname,
        email,
        password,
        avatar:avatar.url
    })

    // Generate tokens for auto-login
    const {accesstoken,refreshtoken}= await generateAccessandRefreshTokens(user._id)

    // Retrieve created user without password and refresh token
    const createduser= await User.findById(user._id).select("-password -refreshtoken")

    if (!createduser) {
        throw new ApiError(500,"Error while creating user")
    }

    // Set cookies for auto-login
    const options={
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }

    return res
    .status(201)
    .cookie("accessToken",accesstoken,options)
    .cookie("refreshToken",refreshtoken,options)
    .json(new ApiResponse(201, {
        user: createduser,
        accesstoken,
        refreshtoken
    }, "User registered and logged in successfully"))
})

const loginuser= asynchandler(async(req,res)=>{
    const {email,password}= req.body;
    
    if ([email,password].some((field)=>field?.trim()==="")) {
        throw new ApiError(400,"Please fill all the fields")    
    }

    const user= await User.findOne({email});
    if (!user) {
        throw new ApiError(401,"Invalid credentials")
    }

    const isPasswordValid= await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401,"Invalid Password")
    }

    const {accesstoken,refreshtoken}= await generateAccessandRefreshTokens(user._id)

    const loggedIn= await User.findById(user._id).select("-password -refreshtoken")
    
    const options={
        httpOnly:true,
        secure: process.env.NODE_ENV === 'development',
        sameSite: 'strict'
    }

    return res
    .status(200)
    .cookie("accessToken",accesstoken,options)
    .cookie("refreshToken",refreshtoken,options)
    .json(new ApiResponse(200,{
        user:loggedIn,
        accesstoken,
        refreshtoken
    },
    "User logged in successfully"))

})

const logoutuser= asynchandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,{
            $unset:{
                refreshtoken:1
            }
        },{
            new:true
        })

    const options={
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,null,"User logged out successfully"))
})

export {registeruser,loginuser,logoutuser}