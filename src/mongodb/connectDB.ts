import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

const mongoURI = process.env.MONGO_URI;

export async function connectDB(){
    try {
        if(mongoURI){
            await mongoose.connect(mongoURI, {
                dbName: "image-processing-service",
            });
            console.log("mongodb connected succesfully")
        } else console.log("we need mongodb uri to connect to db")
    } catch (error) {
        console.error("mongodb conenction error: ", error)
        process.exit(1);
    }
}