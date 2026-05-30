import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

 const generateAccessAndRefreshToken= async(userId)=>{
     try{
          
         const user= await User.findById(userId);
         const accessToken=user.generateAccessToken();
         const refreshToken=user.generateRefreshToken();
        
        
         user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
    
        return {accessToken,refreshToken};

     } catch(error){
         
          console.log(error);
          throw new ApiError(500,"something went wrong while generating Access and Refresh tokem ");
     }
 }


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
     //const coverImageLocalPath=req.files?.coverImage[0]?.path;
     let coverImageLocalPath;
     if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
          coverImageLocalPath=req.files.coverImage[0].path;
     }
   
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

const loginUser=asyncHandler( async( req,res)=>{
  // user se username aur pass mannglo
  // username exist karta h ?
  // check password match kar ra h 
  // access token and refresh token bnalo
  // cookie me bhej do to user 

  const {username, password,email}=req.body;

  if(!username && !email){
      throw new ApiError(400,"username and email  req");
      }
   
      // yaha ho mtlb user has sent both email ans username 
    //  User.findOne({email,username}) this is wrong bcz it means both email and username should match but what we want find user that matches with anyone either email or username 
    const user= await User.findOne({
          $or:[{email},{username}]
     })

     if(!user){
       throw new ApiError(404,"user does not existt ");
     }

     // password check 
     // but password is encypted in bcrypt so bcrypt.compare(User.password,password)
     // we have add a passwordcompare method in schema so use that
    
     // User use nhi karna bcz yeh method humne bnaya h mongoose ne nhi toh use apna wala user
      const isPasswordValid=  await user.isPasswordCorrect(password);
      //                                                
      if(!isPasswordValid){
          throw new ApiError(400,"password sahi karo");
      }
         
   const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
   
    const loggedInUser= await User.findById(user._id).select(
      "-password -refreshToken"
    )
     

    const options={
      httpOnly: true,
      secure: true
    }
   
    return res
    .status(200)
    .cookie("accessToken", accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
      new ApiResponse(
          200,
          {
               user: loggedInUser,accessToken, refreshToken
          } ,
          "user logged in sucesssfully"
      )
    )

})

 const logoutUser= asyncHandler( async( req,res) =>{
      //user ko logout karna h
      // logout tab karoge jab ya toh user want to ya refreshtoken expiry
      // logout me db se pura delete nhi karna h 
      // sirf db me refrshtoken hatado or cookie delte kardo 



    // tum yaha middleware se aaoge mtlb user ka access h
     await User.findByIdAndUpdate(
          req.user._id,
          {
               $set:{
                    refreshToken:undefined
               }
          },
          {
               new : true
          }
     )


      const options={
      httpOnly: true,
      secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options )
    .clearCookie("refreshToken",options )
    .json(
       new ApiResponse(200,{},"user logged out successfully")
    )

 })

  const refreshAccessToken =asyncHandler( async (req,res)=>{
          // access token refresh karna h
     const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
   
     if(!incomingRefreshToken){
          throw new ApiError(401,"unauthorized req");
     }

     try {
          const decodedToken= jwt.verify(
               incomingRefreshToken,
               process.env.REFRESH_TOKEN_SECRET
          )
          const user = await User.findById(decodedToken?._id)
          if(!user){
               throw new ApiError(401,"invalid refresh Token");
          }
     
          if(user?.refreshToken !== incomingRefreshToken){
          throw new ApiError(401,"irefresh token is expired or used");
          }
          // refresh token match toh ek new access stoken bnado ;
        const options ={
          httpOnly: true,
          secure: true
        }
          const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);
     
          return res.status(200)
          .cookie("accessTokem", accessToken, options)
          .cookie("refreshToken" , newRefreshToken , options)
          .json(
               new ApiResponse(
                    200,
                    {accessToken , refreshToken:newRefreshToken},
                    "access token refreshed successfully"
               )
          )
     } catch (error) {
         throw new ApiError(401,error?.message || "invalid refresh Token"); 
     }
    
})
  


export {registerUser , loginUser , logoutUser , refreshAccessToken };