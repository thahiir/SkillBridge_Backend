
const mongoose = require("mongoose");

const crypto = require("crypto");

const userSchema = new mongoose.Schema(
    {
        Fullname:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            lowercase:true
        },
        PhoneNo:{
            type:String,
            required:true
        },
        Email:{
            type:String,
            required:true,
            unique:true
        },
        Password:{
            type:String,
            required:true,
            select:false
        },
        profileImage: {
            type: String,
            default: ""
        },

        profileImageId: {
            type: String,
            default: ""
        },

        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    {timestamps:true}
);

userSchema.methods.getResetPasswordToken = function () {

  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User",userSchema);
