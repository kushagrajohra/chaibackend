import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { videoUpload } from "../controllers/video.controller.js";
// videoFile,thumbnail ,         duration
// title(string). description
// isPublished
// owner

const router=Router();
router.route("/videoUpload").post(
     verifyJWT ,
      upload.fields([
        { name : "videoFile" , maxCount :1},
        { name : "thumbnail" , maxCount :1},

      ]),
    
      videoUpload);

      export default router ;