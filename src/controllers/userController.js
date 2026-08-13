const User = require("../models/User");

const bcrypt = require("bcrypt");

const crypto = require("crypto")

const jwt = require("jsonwebtoken");

const sendEmail = require("../utils/sendEmail")

const {createNotification,} = require("../services/notificationServices")

const NotificationPreference = require("../models/NotificationPreference");

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "skillbridge/profile",
            },
            (error, result) => {

                if (error) return reject(error);

                resolve(result);

            }
        );

        streamifier.createReadStream(buffer).pipe(stream);

    });
};

const cloudinary = require("../config/cloudinary")

const streamifier = require("streamifier")

const { uploadImage } = require("../utils/cloudinaryUpload");

exports.register = async(req,res) =>{
    try{
        const{Fullname,PhoneNo,Email,Password} = req.body;

        const existingUser = await User.findOne({Email});

        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(Password,10);

        const user = await User.create({
            Fullname,PhoneNo,Email,Password:hashedPassword,
        });

        await NotificationPreference.findOneAndUpdate({
            user: user._id,
        },
        {
            user: user._id,
        },
        {
            upsert:true,
            new: true,
            setDefaultsOnInsert:true,
        });

        await createNotification({
            title: "Welcome to SkillBridge",
            message: `Welcome ${user.Fullname}! Your account has been created successfully.`,
            type: "WELCOME",
            user: user._id,
        });

        res.status(201).json({
            success:true,
            message:"User registered successfully",
            user,
        });

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        });

    };
};

exports.login = async(req,res)=>{
    try{
        const {Email,Password} = req.body;
        const user = await User.findOne({Email}).select("+Password");

        if(!user){
            return res.status(401).json({
                sucess:false,
                message:"invalid Credentials"
            });
        }

        const isMatch = await bcrypt.compare(
            Password,
            user.Password
        );
        
        if(!isMatch){
            return res.status(401).json({
                success:false,
                message:"invalid Credentials"
            });
        }

        const token = jwt.sign(
            {id:user._id},
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                Fullname: user.Fullname,
                Email: user.Email,
                PhoneNo: user.PhoneNo,
            },
        });

    }catch(error){
        res.status(500).json({
            success:false,
            message:error.message,
        });

    }
};

exports.updateprofile = async(req, res) =>{
    try{
        const {Fullname, PhoneNo,Email} = req.body;

        const user = await User.findById(req.user.id);

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User Not Found",
            });
        }
        if(Fullname) user.Fullname=Fullname;
        if(PhoneNo) user.PhoneNo=PhoneNo;
        if(Email) user.Email=Email.toLowerCase();

        await user.save();

        res.status(200).json({
            sucess:true,
            message:"Profile update sucsessfully",
            user,
        })
    }
    catch(error){
        res.status(500).json({
            sucess:false,
            message:error.message,
        });

    }
};


exports.updatepassword = async (req, res) => {
    try {
        const { currentpassword, newpassword } = req.body;

        const user = await User.findById(req.user.id)
            .select("+Password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isMatch = await bcrypt.compare(
            currentpassword,
            user.Password
        );

        if (isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        user.Password = await bcrypt.hash(
            newpassword,
            10
        );

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      Email: email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({
      validateBeforeSave: false,
    });

    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
Reset your password using the link below:

${resetUrl}

This link expires in 15 minutes.
`;

    console.log("Raw Token:", resetToken);
    console.log("Stored Hash:", user.resetPasswordToken);
    console.log("Reset URL:", resetUrl);

    await sendEmail({
      email: user.Email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {

    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    console.log("Received Token:", req.params.token);
    console.log("Hashed Token:", hashedToken);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.Password = await bcrypt.hash(password, 10);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.uploadProfileImage = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image",
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Delete previous image
        if (user.profileImageId) {

            await cloudinary.uploader.destroy(
                user.profileImageId
            );

        }

        const result = await uploadImage(req.file.buffer);

        user.profileImage = result.secure_url;
        user.profileImageId = result.public_id;

        await user.save();

        res.status(200).json({

                success: true,

                message: "Profile image uploaded successfully",

                user: {
                    id: user._id,
                    Fullname: user.Fullname,
                    Email: user.Email,
                    PhoneNo: user.PhoneNo,
                    profileImage: user.profileImage,
                }

            });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

exports.getMyProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.id)
            .select("-Password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
exports.removeProfileImage = async (req, res) => {

    try {

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.profileImageId) {

            return res.status(400).json({
                success: false,
                message: "No profile image found",
            });

        }

        await cloudinary.uploader.destroy(
            user.profileImageId
        );

        user.profileImage = "";
        user.profileImageId = "";

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile image removed successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};
