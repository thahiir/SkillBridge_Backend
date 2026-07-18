const {body} = require("express-validator");

exports.registervalidation = [
    body("Fullname").trim().notEmpty().withMessage("Name is required"),
    body("Email").trim().isEmail().withMessage("Invalid email address").normalizeEmail(),
    body("Password").isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")

        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")

        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")

        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")

        .matches(/[^A-Za-z0-9]/)
        .withMessage("Password must contain at least one special character"),
];

exports.loginvalidation = [
    body("Email").trim().isEmail().withMessage("Invalid email address").normalizeEmail(),
    body("Password").notEmpty().withMessage("Password required"),
]