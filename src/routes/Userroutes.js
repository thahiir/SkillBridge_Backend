const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");


const {
    registervalidation,
    loginvalidation,
} = require("../validators/authValidation")


const validate = require("../middleware/validate");
const { protect } = require("../middleware/authmiddleware");

const upload = require("../middleware/multer");

router.post("/register",registervalidation,validate,userController.register);

router.post("/login",loginvalidation,validate,userController.login);

router.put("/profile",protect,userController.updateprofile);

router.put("/change-password",protect,userController.updatepassword);

router.post("/forgot-password",userController.forgotPassword);

router.post("/reset-password/:token",userController.resetPassword);

router.post(
    "/upload-profile",
    protect,
    upload.single("profile"),
    userController.uploadProfileImage
);

router.put("/profile", protect, userController.updateprofile);

router.post(
    "/upload-profile",
    protect,
    upload.single("profile"),
    userController.uploadProfileImage
);
router.get(
    "/me",
    protect,
    userController.getMyProfile
);
router.delete(
    "/remove-profile",
    protect,
    userController.removeProfileImage
);



module.exports = router;