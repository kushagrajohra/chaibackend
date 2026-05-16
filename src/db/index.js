// sabse pehle mongoose lao kyuki isse hi toh db and server connect hoga 
// dekho hum udhar ani main index file me sab initilaise nhi karte h bcz wha yeh messy ho jayega 
// usse better aap koi dusri file me sab initilaise karlo or idhar se export karlo phir apan udhar 
/// main file me import kar lenge 
import mongoose from "mongoose";        
 import { DB_NAME } from "../constants.js";

 
// ab db baat ayi mtlb try catch and aysyc await ka use karna padega kyuki db connect hone me time lagta h toh hum async await ka use karenge taki jab tak db connect na ho jaye tab tak server start na ho
// aur agar db connect nahi hota h toh error aayega toh usko catch karna padega taki pata chal sake ki db connect nahi ho rha h
// aur agar db connect ho jata h toh server start kar denge taki hum apne server ko use kar sake
const connectDB=async()=>{
    try{
       const connectionInstance=await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
   console.log(`connected to database ${connectionInstance.connection.host}`);
    }
    catch(error){
        console.log("error h re:",error);
        process.exit(1);
    }
}
export default connectDB;
//mongoose.connect(url,object);