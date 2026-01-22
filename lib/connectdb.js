import mongoose from "mongoose"

export const connectdb = async() => {
    mongoose.connect(process.env.MONGO_URL)
    console.log("connected")
}