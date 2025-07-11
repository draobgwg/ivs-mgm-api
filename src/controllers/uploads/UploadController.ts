import path from "path";
import fs from "fs";
import { UploadService } from "../../services/uploadService";
import { checkToken } from "../../utills/helper";
require("dotenv").config();

const siteHost = process.env.SITE_HOST;
const AUTHORIZATION = process.env.AUTHORIZATION;

class UplaodController {
    private uploadService: any;
    constructor() {
        this.uploadService = new UploadService();
    }

    getUpload = async (req, res) => {
        try {
            console.log("reached on upload");
            if (req.file) {
                // Access the file path
                // Construct the public URL for the uploaded file
                const fileUrl = `${siteHost}/video-uploads/${req.file.filename}`;
                const videoUrl = `${siteHost}/video/${req.file.filename}`;
                const fileDownloadPath = `${siteHost}/api/v1/uploads/get/${req.file.filename}`;
                // Send back the file URL
                const instertId = await this.uploadService.uploadVideo(
                    req.file,
                );
                res.json({
                    message: "File uploaded successfully.",
                    fileUrl,
                    videoUrl,
                    downloadLink: fileDownloadPath,
                    fileName: req.file.filename,
                    id: instertId["id"],
                });
            } else {
                res.status(400).send("No file uploaded.");
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    download = async (req, res) => {
        const filename = req.params.filename;
        const filePath = path.join("video-uploads", filename);
        try {
            // Check if file exists
            if (fs.existsSync(filePath)) {
                // Set headers to force download
                res.download(filePath, filename, err => {
                    if (err) {
                        res.status(500).send("File could not be downloaded.");
                    }
                });
            } else {
                return res.status(404).send("File not found.");
            }
        } catch {}
    };

    isOptInPostMedia = async (req, res) => {
        const id = req.params.id;
        const isOptIn = req.body.isOptIn;
        try {
            const data = await this.uploadService.isOptInPostMedia(id, isOptIn);
            if (!data)
                return res.status(400).json({
                    error: "Wrong Video Id!",
                    status: 0,
                });
            res.status(201).json({
                message: "updated!",
                status: 1,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    authorize = async (req, res, next) => {
        const authorizationHeader = req.headers.authorization;

        if (authorizationHeader && AUTHORIZATION === authorizationHeader) {
            // Authorization

            next();
        } else {
            // Authorization header is missing, handle the error
            res.status(401).json({ error: "Authorization header is required" });
        }
    };

    getAllVideos = async (req, res) => {
        try {
            const headers = req.headers;
            const response = await checkToken(headers.authorization);
            if (!response)
                return res.status(403).json({ error: "Unauthenticated" });
            const data = await this.uploadService.videos(req);
            if (!data)
                return res.status(400).json({
                    error: "Something went wrong!",
                    status: 0,
                });
            res.status(200).json({
                data,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    updateVideoFeedStatus = async (req, res) => {
        try {
            const headers = req.headers;
            const response = await checkToken(headers.authorization);
            if (!response)
                return res.status(403).json({ error: "Unauthenticated" });
            const data = await this.uploadService.updateVideoFeedStatus(
                req.body.videoId,
                req.body.isActive,
            );
            if (!data)
                return res.status(400).json({
                    error: "Something went wrong!",
                    status: 0,
                });
            res.status(200).json({
                data,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };
}

const uplaodController = new UplaodController();
export default uplaodController;
