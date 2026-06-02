import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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
               $unset:{
                    refreshToken:1
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

  const refreshAccessToken =asyncHandler( async (req,res)=>{ a
          // access token refresh karna h
          
     const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
    
     if(!incomingRefreshToken){
          throw new ApiError(401,"unauthorized req or may be user is logged out");
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
   const changeCurrentPassword = asyncHandler( async(req, res)=>{
       // user has to use old password to change to new one 
       // user se password receive karlo
       //. user exist check
       //  password change 
       // reponse sent 
       console.log("&&&");
       const {oldPassword , newPassword} = req.body;
      const user= await User.findById(req.user?._id);
     //  if(!user){

     //  }
      
       // check old password matching 
      const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
      if(!isPasswordCorrect){
          throw new ApiError(400,"invalid old password");
      }

      user.password = newPassword;
      await user.save({ validateBeforeSave :false});

      return res.status(200)
      .json(
          new ApiResponse(200,{},"password has changed succesfully")
      )

   })

   const getCurrentUser= asyncHandler (async(req, res)=>{
      return res.status(200)
      .json(
          new ApiResponse(200,{user:req.user},"current user fetch")
      )
   })

   const updateAccountDetails = asyncHandler( async(req, res)=>{
      const {fullName , email} = req.body;
      if(!fullName || !email){
          throw new ApiError(200,"all field needed to update");
      }
     
     const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
               $set :{
                    fullName,email
               }
          },
          {new :true}
      ).select("-password")

      return res.status(200)
      .json(
          new ApiResponse(200,user,"updation done ")
      );

   })
   
  
   const updateUserAvatar = asyncHandler ( async (req,res)=>{
     // files are stored in multer and its LocalFilePath is found
     // check user logged in ;
     // check passwword
     // cloudinary url
     // user exist 
     // change 
     // reposne 

       const avatarLocalPath = req.file?.path;

       if(!avatarLocalPath){
          throw new ApiError(400,"avatar file is missing");
       }

       const avatar= await uploadOnCloudinary(avatarLocalPath);

       if(!avatar.url){
          throw new ApiError(500,"error while uploading an avatar")
       }

      const user= await User.findByIdAndUpdate(
          req.user._id,
          {
               $set:{avatar: avatar.url }
          },
          {new :true}
       ).select("-password");

       return res.status(200)
   .json(
     new ApiResponse(200,user,"avatar Updated succesfullt")
   )
   


   })

   const updateUserCoverImage = asyncHandler ( async (req,res)=>{
     // files are stored in multer and its LocalFilePath is found
     // check user logged in ;
     // check passwword
     // cloudinary url
     // user exist 
     // change 
     // reposne 

       const CoverImageLocalPath = req.file?.path;

       if(!CoverImageLocalPath){
          throw new ApiError(400,"CoverImage file is missing");
       }

       const CoverImage= await uploadOnCloudinary(CoverImageLocalPath);
//          coverImage
       if(!CoverImage.url){
          throw new ApiError(500,"error while uploading an avatar")
       }

       const user = await User.findByIdAndUpdate(
          req.user._id,
          {
               $set:{coverImage: CoverImage.url }
          },
          {new :true}
       ).select("-password");

   return res.status(200)
   .json(
     new ApiResponse(200,user,"cover iamge Updated succesfullt")
   )
   })

   const getUserChannelProfile = asyncHandler ( async (req,res) =>{
     /// iska kaam h user ke channel profile ko fetch karna mtlb user ka profile jisme uska name , avatar , cover image , followers count , following count etc. hota h
     // dekho koi user search karega chai or code toh url se uska yt page opne hoha jaha uska avatar, background,subsciber ,subscribeTo


     // 1 . to identify user you are searching eg hitesh to woh hitesh ka profile open kar denge 
     /// hume user ki info req.body se nhi url se milegi bcz tumne seach kra h koi submit nhi 
     // url se information nikalne ke liye params 
   const { username } = req.params;
    
     if(!username?.trim()){
           throw new ApiError(400,"username is missing ");
     }

      const channel = await User.aggregate([
          { // first pipeline 
               $match :{
                    
                    username : username ?.toLowerCase()
               }
               // after this first aggregation we recieve only one document bcz unique username is present 
          } ,
          { // second pipeline
               $lookup : {
                    // to find no of subscriber in username channel 
                    // hum humara username se jayenge subscription model me or waha woh document jisme channel woh ho joh apne username ka h ab yaha yeh number of document nikal lo

                    from : "subscriptions",
                    localField : "_id",
                    foreignField : "channel",
                    as : "subscribers"
               } } ,
               { // thrird pipeline 
                 $lookup : {
                    from : "subscriptions",
                    localField : "_id",
                    foreignField : "subscriber",
                    as : "subscribedTo"

                 }   
                },
                {
                    // fourth pipeline 
                    $addFields :{
                         subscribersCount : {
                              $size : "$subscribers"
                         },
                         channelsSubscribedToCount : {
                              $size : "$subscribedTo"
                         },
                         isSubscribed : {
                              $cond : {
                                   if :{ $in:[req.user?._id , "$subscribers.subscriber",]},
                                   then :true,
                                   else :false
                              }
                         }
                    }
                } ,
                {
                    // 5th pipeline 
                    $project :{
                         fullName :1,
                         username :1,
                         subscribersCount : 1,
                         channelsSubscribedToCount : 1,
                         isSubscribed : 1,
                         avatar :1,
                         coverImage :1,
                         email :1

                    }
                }

      
               
          
      ])

      if(!channel?.length){
          throw new ApiError(404,"channel does not exist");
      }

      return res.status(200)
      .json(
          new ApiResponse(200,channel[0],"user channel fetched succesfully")
      )

      

   })

   const getWatchHistory = asyncHandler ( async (req, res)=>{
     // logic ->
     // humara user find kar lenge  jisko watch history dekhna h 
     // ab user ke watchHistory me videoid present hogi
     // ab humare isme toh sirf video id h hume uska thumbnail yeh sab chahiye toh ab yaha se lookup karke videomodel me jayenge or joh joh video humari watchHistory me h unka indormation le lenge 
     // but ab tum dekho hume videomodel me ek field h owner ab owner ka avatar or uski information jes eowner ka username or yeh sab bhi dikhna pdta h 
     // ab hum yaha videoModel se phir se join means look up karenge in usermodel bcz owner ka data bhi toh user model me hi h 
     // nesting usermodel waha se Videomodel and again goes to UserModel
     console.log("chechking &&");
     const a=new mongoose.Types.ObjectId(req.user._id);
     console.log("a->" ,a);
     console.log("888*");

     const user = await User.aggregate([
          { // 1st pipeline 
               // req.user._id toh yaha ek string milti h id ki but mongodb me ese string ke form me nhi store hota yeh waha par mongoose ki objectID ke form me store hota h
               // agara tum monggooose ke kuch uperation kar re example user.find() toh mongoose apne aap isko moongoose objectID me covert kar dega no nneed todo it manullay 
               // but idhar jab aggregation pipeline ke operation karoge toh kanr pdega 
                
               $match :{
                 //   _id : req.user._id   !!!!yaha ese req.user._id direct nhi likh skte bcz yaha aap aggregation me yeh use kar re 
                 _id : new mongoose.Types.ObjectId(req.user._id)
               }
     // match kya karega User schema me yeh req.Id find kar lega that is one document 
          }
          ,{ // 2nd pipeline
               // ab har ek look up ke liye owner ko find karna h mtlb yaha nesting lagegi 

               $lookup :{
                    from : "videos",
                    localField : "watchHistory",
                    foreignField : "_id",
                    as : "watchHistory" ,
                    pipeline :[
                         {
                              // nested first pipeline 
                               $lookup :{
                                   from : "users",
                                   localField : "owner",
                                   foreignField : "_id",
                                   as: "owner",
                                   pipeline :[
                                        {
                              // why we needthis also dekho owner apne find kar liya but usme toh bhto information h password username email etc but humko selected information hi chahiye for our watch  history to isliye yeh pipleine lgayi h
                                      $project :{
                                        avatar :1,
                                        username :1,
                                        fullName :1
                                      }
                                        }
                                   ]

                               }

                         },
                         {
                              // why this -> owner me data array ke form me ayega and we need first index
                              $addFields : {
                                  owner:{
                                   $first: "$owner"
                                  }
                              }
                         }
                    ]
               }

          }
     ])

     return res
     .status(200)
     .json(
          new ApiResponse(
               200,
                user[0].watchHistory, 
                "watch history fetched successfully")
     )
      })

//       //return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             user[0].watchHistory,
//             "Watch history fetched successfully"
//         )
//     )

     

   
export {
     registerUser ,
      loginUser ,
       logoutUser ,
        refreshAccessToken , 
        changeCurrentPassword ,
         getCurrentUser ,
         updateAccountDetails,
         updateUserAvatar,
         updateUserCoverImage,
         getUserChannelProfile ,
         getWatchHistory
     };