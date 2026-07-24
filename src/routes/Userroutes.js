const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

const {
    registervalidation,
    loginvalidation,
} = require("../validators/authValidation");

const validate = require("../middleware/validate");
const { protect } = require("../middleware/authmiddleware");
const upload = require("../middleware/multer");

// ==============================
// Authentication
// ==============================

router.post(
    "/register",
    registervalidation,
    validate,
    userController.register
);

router.post(
    "/login",
    loginvalidation,
    validate,
    userController.login
);

// ==============================
// Profile
// ==============================

router.get(
    "/me",
    protect,
    userController.getMyProfile
);

router.put(
    "/profile",
    protect,
    userController.updateprofile
);

router.post(
    "/upload-profile",
    protect,
    upload.single("profile"),
    userController.uploadProfileImage
);

router.delete(
    "/remove-profile",
    protect,
    userController.removeProfileImage
);

// ==============================
// Password
// ==============================

router.put(
    "/change-password",
    protect,
    userController.updatepassword
);

router.post(
    "/forgot-password",
    userController.forgotPassword
);

router.post(
    "/reset-password/:token",
    userController.resetPassword
);

module.exports = router;