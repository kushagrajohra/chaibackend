import mongoose ,{Schema} from 'mongoose';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema=new Schema(
    {
       username:{
        type:String,
        unique:true,
        required:true,
        index:true,
        // index:true mtlb aise field jise hum apne database me index karna chahte h taki us field ke basis par queries ko optimize kiya ja sake
        lowercase:true,
        trim:true
         },

         email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true
         },

         fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
         },

         avatar:{
            type:String,
            // avatar mtlb aise field jisme user ke profile picture ka url store kiya jata h
            // cloudinary se url le lenge or yaha daal denge thats why string 
            required:true
         },

         coverImage:{
            type:String,
            // cover image mtlb aise field jisme user ke cover picture ka url store kiya jata h
            // cloudinary se url le lenge or yaha daal denge thats why string 
         },
// watch history ia array of the video id 
         watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"video"
            }
         ],

         password:{
            type:String,
            required:[true,"password is required"]
         },

         refreshToken:{
            type:string
         }

    },
    {
       timestamps:true
    }
)
 userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password=bcrypt.hash(this.password,10) 
    next();
})

userSchema.methods.isPasswordCorrect=async function(Password){
    return await bcrypt.compare( password,this.password);
}

userSchema.methods.generateAccessToken=function(){
  return jwt.sign(
    {
        _id:this.id,
        email:this.email,
        username:this.username,
         fullName:this.fullName
    },
    Processenv.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateRefreshToken=function(){
  return jwt.sign(
    {
        _id:this.id,
       
    },
    Processenv.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User=mongoose.model("User",userSchema);