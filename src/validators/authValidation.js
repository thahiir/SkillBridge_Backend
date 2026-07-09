const {body} = require("express-validator");

exports.registervalidation = [
    body("Fullname").trim().notEmpty().withMessage("Name is required"),
    body("Email").trim().isEmail().withMessage("Invalid email address").normalizeEmail(),
    body("Password").isLength({min:6}).withMessage("Password must be at least 6 characters"),
];

exports.loginvalidation = [
    body("Email").trim().isEmail().withMessage("Invalid email address").normalizeEmail(),
    body("Password").notEmpty().withMessage("Password required"),
]