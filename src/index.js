// require(`dotenv`).config() yeh line hum apne project ke root directory me .env file se environment variables ko load karne ke liye use karte hain
// .env file me hum apne environment variables ko define karte hain jaise ki PORT, MONGO_URI, DB_NAME etc
// yeh environment variables humare application ke liye important hote hain kyunki inhe hum apne application ke different parts me use karte hain jaise ki database connection, server port etc
// dotenv package ko install karne ke baad hum require(`dotenv`).config() line ko apne index.js file me add karenge taki hum apne .env file se environment variables ko load kar sake aur unhe apne application me use kar sake

import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
});

connectDB();
//console.log("server is running on port", process.env.PORT);

// data base connect we have make our dp using mongo db atlas we have created our dp in mongo db atlas and we have got our connection string from there and we will use that connection string to connect our server to the database
// mongodb atlas has given a connection string in which we have to replace the password and the name of the database that we want to connect to
// this connection string is used to connect our server to the database and we will use mongoose to connect to the database
// mongoose is an ODM (Object Data Modeling) library for MongoDB and Node.js it provides a straight forward, schema based solution to model our application data it includes built in type casting validation query building business logic hooks and more
// we will use mongoose to connect to the database and to define our schemas and models for our application data

// import mongoose   from "mongoose";
// import {DB_NAME} from "./constants"
// import express from "express";
/// mongoose.connect use karke hum apne server ko database se connect karenge
// mongoose.connect(connectionString, options) yeh function do parameters leta hai connection string aur options
// connection string mtlb string joh origin btata h

// app ko bhi yahi initialise kar lete h express() function se
// const app=express();
// // ab hum apne server ko database se connect karenge mongoose.connect() function ka use karke;
// (async()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`
//         )
//         app.on("errror",(error)=>{
//             console.log("EEROR:",error);throw error;
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`server is running on ${process.env.PORT}`);
//         });
//         console.error("error",error);
//     } catch (error) {
//         console.log("Error connecting to database", error);
//         throw error;
//     }
// })()
