import { Router } from "express";
import { registeruser, loginuser, logoutuser } from "../Controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJwt } from "../middlewares/Auth.js";

const router = Router();
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,

        }
    ]),registeruser

)

export default router;