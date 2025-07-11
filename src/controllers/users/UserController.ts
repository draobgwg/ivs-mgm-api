import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";
dotenv.config();
import { loginFormValidation } from "../../validations/users";
import { UserService } from "../../services/userService";
import { checkToken } from "../../utills/helper";

class UserController {
    private userService: any;

    constructor() {
        this.userService = new UserService();
    }

    getAllUsers = async (req, res) => {
        try {
            const headers = req.headers;
            const response = await checkToken(headers.authorization);
            if (!response)
                return res.status(403).json({ error: "Unauthenticated" });
            const data = await this.userService.users(req);
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

    login = async (req, res) => {
        try {
            const { error } = await loginFormValidation.validate(req.body);
            if (error) throw error;

            const user = await this.userService.login(req.body);

            const secretKey = process.env.SECRETKEY;
            if (!user)
                return res.status(400).json({
                    error: "Invalid credentials!",
                });

            bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
                if (err) throw err;

                if (isMatch) {
                    const token = jwt.sign(
                        {
                            userId: user.id,
                            username: user.email,
                        },
                        secretKey,
                        { expiresIn: "1h" },
                    );

                    delete user["password"];
                    res.status(201).json({
                        message: "Data registered successfully",
                        user,
                        accessToken: token,
                    });
                } else {
                    res.status(401).json({ message: "Invalid credentials" });
                }
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    };

    verifyToken = async (req, res) => {
        if (req.body.token) {
            const response = await checkToken(req.body.token);
            if (response) return res.status(200).json({ success: true });
            else return res.status(403).json({ error: "Unauthenticated" });
        } else {
            res.status(401).json({ error: "Unauthorized" });
        }
    };

    exportUsers = async (req, res) => {
        const authorization = req.query.token;
        const response = await checkToken(authorization);
        if (!response)
            return res.status(403).json({ error: "Unauthenticated" });
        try {
            const data = await this.userService.exportUsers(req);
            if (!data) {
                console.error("Error fetching users");
                return res
                    .status(500)
                    .json({ message: "Error fetching users" });
            }

            // Create a new workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Users");
            console.log(data, "data");
            // Define worksheet columns
            worksheet.columns = [
                { header: "ID", key: "id", width: 5 },
                { header: "Title", key: "title", width: 10 },
                { header: "Name", key: "name", width: 30 },
                { header: "Organization", key: "organization", width: 10 },
                { header: "Email", key: "email", width: 40 },
                { header: "Phone Number", key: "phone_number", width: 40 },
                { header: "Created At", key: "created_ts", width: 15 },
            ];

            // Add rows from query results
            data.forEach(user => {
                worksheet.addRow(user);
            });
            console.log(worksheet, "worksheet");
            const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);
            // Define file path and file name
            const filePath = path.join(
                "exports",
                "users-" + uniqueSuffix + ".xlsx",
            );

            // Check if directory exists, if not create it
            if (!fs.existsSync(path.join("exports"))) {
                fs.mkdirSync(path.join("exports"), {
                    recursive: true,
                });
            }
            console.log(filePath, "filePath");
            // Write the workbook to a file
            try {
                await workbook.xlsx.writeFile(filePath);
            } catch (e) {
                console.log("error loged", e);
            }

            console.log("file writed done");
            if (fs.existsSync(filePath)) {
                // Set headers to force download
                res.download(filePath, err => {
                    if (err) {
                        res.status(500).send("File could not be downloaded.");
                    } else {
                        // Delete the file after download
                        fs.unlink(filePath, err => {
                            if (err) {
                                console.error("Error deleting file:", err);
                            } else {
                                console.log(
                                    `File ${filePath} deleted after download.`,
                                );
                            }
                        });
                    }
                });
            } else {
                res.status(404).send("File not found.");
            }
        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    };
}
const userController = new UserController();
export default userController;
