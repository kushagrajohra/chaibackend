import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


const registerUser= asyncHandler( async(req,res)=>{
     // try to write steps what we need to do during registration 
     // 1 get the data from user 
     // validate the data means check whaterver requiref field is present or not unique is there  this type of validation
     // check if user already exist or not  
     // ab profile picture hogi yeh sab ko multer ke through local server par store karlo 
     // and upload in cloudinary and get the url of the image
     // cloudinary send reposnse usse url nikalo and save in db
     // ab userdb me upload karne ke liye user object create karo 
     // ab yeh req ka response bhejoge client ko toh remove refresh token and passwrod from response 
     //check for user creation 
     // send response to client 



      const {fullName,email,username,password} = req.body;
       console.log("email",email);
       
       if(
          [fullName,email,username,password].some((field)=>
               field?.trim() === ""
          )
       ){
          throw new ApiError(400,"all fields are required") ;
       }

     const existingUser= await User.findOne( {
          $or:[ {email},{username}]
                            } )

     if(existingUser){
          throw new ApiError(409,"user alreay exist with this email or username") ;
     }

     const avatarLocalPath=req.files?.avatar[0]?.path;
     const coverImageLocalPath=req.files?.coverImage[0]?.path;
   
     if(!avatarLocalPath){
          throw new ApiError(400,"avatar is requiredd");
     }

     const avatar=await uploadOnCloudinary(avatarLocalPath);
     const coverImage=await uploadOnCloudinary(coverImageLocalPath);

     if(!avatar){
          throw new ApiError(400,"avatar is requireddd");
     }

     const user = await User.create({
          fullName,email,
          avatar:avatar.url,
          coverImage:coverImage?.url||"",
          username:username.toLowerCase(),
          password
     })
  const createdUser = await User.findById(user._id).select(
     "-password -refreshToken"
  )

   if(!createdUser){
     throw new ApiError(500,"something went wrong while registering user");
}
  return res.status(201).json(
     new ApiResponse(200,createdUser,"user registered successfully")
  )

})
export {registerUser};