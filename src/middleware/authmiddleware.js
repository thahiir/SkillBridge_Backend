const jwt = require("jsonwebtoken");



exports.protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        console.log("Authorization Header:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        const token = authHeader.split(" ")[1];

        console.log("Token:", token);
        console.log("JWT Secret:", process.env.JWT_SECRET);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded:", decoded);

        req.user = decoded;

        next();

    } catch (error) {

        console.log("JWT ERROR NAME:", error.name);
        console.log("JWT ERROR MESSAGE:", error.message);

        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};