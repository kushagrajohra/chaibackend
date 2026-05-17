import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app=express()
// app.use hum generally tab use karte h jab hume apne server me kuch middleware use karna hota h middleware mtlb aise functions jo request aur response ke beech me execute hote h aur unka kaam hota h request aur response ko modify karna ya unke sath kuch additional functionality provide karna
// cookie-parser ek middleware hai jo humare server me cookies ko parse karne ke liye use hota hai
// cookies mtlb aise small pieces of data jo client ke browser me store hote h aur unhe server ke sath exchange kiya jata h har request ke sath
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    //. origin mtlb aise domain jaha se humare server ko request aayegi aur hum us domain ko allow karna chahte h apne server ke sath interact karne ke liye
    credentials:true,
    // credentials:true mtlb aise requests jisme cookies ya authentication headers hote h unhe allow karna chahte h hum apne server ke sath interact karne ke liye
}))

app.use(express.json({limit:"16kb"}));
// express.json() ek middleware hai jo humare server me incoming requests ke body ko json format me parse karne ke liye use hota hai
app.use(urlencoded({extended:true,limit:"16kb"}));
// urlencoded() ek middleware hai jo humare server me incoming requests ke body ko url encoded format me parse karne ke liye use hota hai
app.use(express.static("public"));
// express.static() ek middleware hai jo humare server me static files ko serve karne ke liye use hota hai static files mtlb aise files jo humare server me store hote h aur unhe client ke browser me serve kiya jata h jaise ki images, css files, js files etc
// humne pucblic folder ko static folder ke roop me serve karne ke liye express.static() middleware ka use kiya hai taki hum apne server me store static files ko client ke browser me serve kar sake
app.use(cookieParser());
// cookieParser() ek middleware hai jo humare server me cookies ko parse karne ke liye use hota hai cookies mtlb aise small pieces of data jo client ke browser me store hote h aur unhe server ke sath exchange kiya jata h har request ke sath


export { app }