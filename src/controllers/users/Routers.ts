import express from "express";
import userController from "./UserController";
const userRouter = express.Router();

userRouter.route("/").get(userController.getAllUsers);
userRouter.route("/login").post(userController.login);
userRouter.route("/export").get(userController.exportUsers);
userRouter.route("/verify-token").post(userController.verifyToken);

export default userRouter;
