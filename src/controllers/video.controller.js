import  { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const videoUpload = asyncHandler( async( req, res)=>{
   
         if(!req.files){
  throw new ApiError(400, "all files are not given by user");
         }

    // hume new video upload karna h
     let videoLocalPath;

// Explicitly check if the files object and the specific field array exist with data
if (req.files && Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
    videoLocalPath = req.files.videoFile[0].path;
} 
 

// Check if it's missing and handle it gracefully using your ApiError class
if (!videoLocalPath) {
    throw new ApiError(400, "Please upload a valid video file!");
}


const videoFile = await uploadOnCloudinary (videoLocalPath);
 if(!videoFile.url){
    throw new ApiError(500 , "videoFile upload on cloudinary problem ");
 }

    let thumbnailLocalPath;

// Explicitly check if the files object and the specific field array exist with data
if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
}

// Check if it's missing and handle it gracefully using your ApiError class
if (!thumbnailLocalPath) {
    throw new ApiError(400, "Please upload a valid  thumbnail file!");
}

 const thumbnail = await uploadOnCloudinary (thumbnailLocalPath);
 if(!thumbnail.url){
    throw new ApiError(500 , "thumbnail upload on cloudinary problem ");
 }

 const {title , description , isPublished } = req.body ;
 const user= req.user?._id;

 if(!(title&& description && isPublished)){
    throw new ApiError(400 , "title , description or isPublished oe of the field is not given by user");
 }

if(!user){
    throw new ApiError(400, "user problem may be Tokens expired ");
}
  
 


    const videoentry = await Video.create(
        {
            videoFile : videoFile.url,
            thumbnail : thumbnail.url,
            title :title ,
            description : description,
            isPublished : isPublished ,
            owner : user ,
            duration : videoFile.duration||0
        })

    const uploadedVideo = await Video.findById(videoentry?._id)
                        ;
    if(!uploadedVideo){
        throw new ApiError(500 ,"problem **");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(201 , uploadedVideo ," video uploadede succesfullt")
    )





    
})
// videoFile,thumbnail ,         duration
// title(string). description
// isPublished
// owner

export { videoUpload } ;