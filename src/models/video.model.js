import mongoose ,{Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema=new Schema(
    {

        videoFile:{
            type:String,// cloudinary url
            required:true
        },
        thumbnail:{
            type:String,  // cloudinary url
            required:true
        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        duration:{
            type:Number,// cloudinary se video upload karne ke baad hume video ki durstion mil jati h usse hum yaha store kar sakte h taki jab bhi hum video ko play kare to uski durstion ko display kar sake
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
            
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",

        }

    },
    { timestamps:true}
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video=mongoose.model("Video",videoSchema);


// user koi video upload karega toh uska controller 
//


// check user exist 
// files ke Url toh iske liye ek new Middleware bna lenge or usme cloudinary par upload karkke sab ke url ko req.file me store kar lunga 
// video Schema me db me entry kar dete h