import mongoose , {Schema, Types} from "mongoose";

const subscriptionSchema=new Schema({
   subsciber : {
      type:Schema.Types.ObjectId,// one who is subscibing
      ref:"User"

    },
    channel:{
        type:Schema.Types.ObjectId,// one to whom an subsciber is subscibing 
        ref: "User",
        
    }

},{timestamps:true})
export const Subscription =mongoose.model("Subscription",subscriptionSchema);