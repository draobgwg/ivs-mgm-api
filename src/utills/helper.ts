import multer from "multer";
import path from "path";
const jwt = require("jsonwebtoken");
var ls = require("local-storage");
import dotenv from "dotenv";
dotenv.config();
const secretKey = process.env.SECRETKEY;

// Setup multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("destination", file);
        cb(null, "video-uploads/"); // Specify the directory to store uploaded files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.originalname +
                "-" +
                uniqueSuffix +
                path.extname(file.originalname),
        );
    },
});

// File filter to allow only media files (images, audio, video)
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "audio/mpeg",
        "audio/mp3",
    ];

    // Check if the file type is allowed
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        cb(
            new Error("Only media files (images, audio, video) are allowed!"),
            false,
        ); // Reject the file
    }
};
// Create multer upload middleware
const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: fileFilter, // Apply the file filter
}); // 100MB limit
export const authenticateToken = async (req, res, next) => {
    const token = ls.get("token");

    console.log(token, "token");
    if (token == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

export const checkToken = async token => {
    const response = await jwt.verify(token, secretKey, (err, user) => {
        if (err)
            return false; // Forbidden
        else return true;
    });

    return response;
};
export default upload;
