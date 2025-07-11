import express from "express";
import uplaodController from "./UploadController";
import upload from "../../utills/helper";
const uploadRouter = express.Router();

uploadRouter
    .route("/")
    .post(
        uplaodController.authorize,
        upload.single("file"),
        uplaodController.getUpload,
    );
uploadRouter
    .route("/get/:filename")
    .get(uplaodController.authorize, uplaodController.download);
uploadRouter
    .route("/is-opt-in-post-media/:id")
    .patch(uplaodController.authorize, uplaodController.isOptInPostMedia);

uploadRouter.route("/videos").get(uplaodController.getAllVideos);
uploadRouter
    .route("/update-video-feed-status")
    .patch(uplaodController.updateVideoFeedStatus);

export default uploadRouter;
