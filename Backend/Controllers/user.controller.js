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
        await user.save({validateBeforeSave:false}

        )
         return {accesstoken,refreshtoken}

    } catch (error) {
        console.log("error in generateaccessandrefresh in usercontroller",error)
        throw new ApiError(501,"something went wrong")
    }
}

const registeruser= asynchandler(async(req,res)=>{
    const {fullname,email,password}= req.body;

    if ([fullname,email,password].some((field)=>field?.trim()=="")) {
        throw new ApiError(401,"Please fill all the fields")

    }

    const existeduser= await User.findOne({
        $or:[{email}]
    });

    if (existeduser) {
        throw new ApiError(401,"User already exists")
    }

    const avatarlocalpath= req.files?.avatar[0].path

    if(!avatarlocalpath){
        throw new ApiError(401,"Avatar is required")
    }

    const avatar= await uploadOnCloudinary(avatarlocalpath)

    if (!avatar) {
        throw new ApiError(401,"Error while uploading")
    }

    const user= await User.create({
        fullname,
        email,
        password,
        avatar:avatar.url

    })

    const createduser= await User.findById(user._id).select("-password -refreshToken")

    if (!createduser) {
        throw new ApiError(401,"Error while creating user")
    }

    return res.status(201).json(
        new ApiResponse(201,createduser,"User registered successfully")
    )
})


