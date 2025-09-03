import mongoose from "mongoose";
import dotenv from "dotenv";
//import { Db_name } from "../../constants";

const ConnectDB= async()=>{
    try {
        console.log("Connecting to:", process.env.DATABASE_URL)
        
        const connectionInstance= await mongoose.connect(`${process.env.DATABASE_URL}`);
        console.log(`Connected to the database successfully`);

    } catch (error) {
       console.log('Error while connecting to the database', error);
        throw error
    }
}

export default ConnectDB;