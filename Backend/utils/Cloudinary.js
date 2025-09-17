import {v2 as cloudinary} from 'cloudinary'
import {response} from 'express'
import fs from 'fs'
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET

});

console.log("cloudinary config",cloudinary.config())

const uploadOnCloudinary= async(localFilePath)=>{
    try{
        if (!localFilePath) return null
            const response= await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
            })

            fs.unlinkSync(localFilePath);
            return response
        

    }
    catch(err){
        console.log("cloudinary upload fail error in cloudinary .js",err)
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uploadOnCloudinary}