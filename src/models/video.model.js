import mongoose ,{Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema=new Schema(
    {

        videoFile:{
            type:String,// cloudinary url
            required:true
        },
        thumbnail:{
            type:string,// cloudinary url
            required:true
        },
        title:{
            type:string,
            required:true
        },
        description:{
            type:string,
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