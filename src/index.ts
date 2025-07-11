import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import database from "./database/connection";

import userRouter from "./controllers/users/Routers";
import uploadRouter from "./controllers/uploads/Routers";
import machineRouter from "./controllers/machine/Routers";
const app = express();
const server = http.createServer(app);
const allowedOrigins = [];
const port = 3011;
app.use(express.json()); // This parses the request body as JSON
app.use(cors({ origin: allowedOrigins }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/v1/users", userRouter);
app.set("view engine", "ejs");
app.use("/api/v1/uploads", uploadRouter);
app.use("/api", machineRouter);
app.use(
    "/video-uploads",
    express.static(path.join(__dirname, "../video-uploads")),
);

database
    .connectDB()
    .then(() => {
        console.log("Connected to database");

        app.get("/", (req, res) => {
            res.send("");
        });

        // Routes
        app.get("/admin/users", (req, res) => {
            // Query the database to fetch user data

            res.render("admin/users", {
                users: [],
                currentURL: "admin/users",
            });
        });
        app.get("/admin/dashboard", (req, res) => {
            // Query the database to fetch user data
            database.pool.query(
                "SELECT created_ts FROM videos",
                (err, results) => {
                    if (err) {
                        console.error("Error fetching dashboard data:", err);
                        res.status(500).send("Error fetching dashboard data");
                    } else {
                        res.render("admin/dashboard", {
                            currentURL: "admin/dashboard",
                            results: JSON.stringify(results),
                        });
                    }
                },
            );
        });

        app.get("/admin", (req, res) => {
            res.redirect("/admin/login");
        });
        app.get("/admin/login", (req, res) => {
            // Query the database to fetch user data

            res.render("admin/login", {});
        });

        app.get("/admin/users/delete/:id", (req, res) => {
            const userId = req.params.id;

            // Query the database to delete the user
            database.pool.query(
                "DELETE FROM users WHERE id = ? and role=2",
                [userId],
                (err, result) => {
                    if (err) {
                        console.error("Error deleting user:", err);
                        res.status(500).send("Error deleting user");
                    } else {
                        res.redirect("/admin/users");
                    }
                },
            );
        });

        app.get("/video/:id", (req, res) => {
            const postId = req.params.id;

            res.render("videoDetail", {
                video: postId,
            });
        });

        app.get("/video-feed", (req, res) => {
            const postId = "";
            database.pool.query(
                "SELECT name, created_ts FROM videos WHERE video_feed=1 and created_ts ORDER BY RAND()",
                (err, results) => {
                    if (err) {
                        console.error("Error fetching dashboard data:", err);
                        res.status(500).send("Error fetching dashboard data");
                    } else {
                        console.log(results, "results");
                        res.render("videoFeed", {
                            currentURL: "admin/dashboard",
                            results: JSON.stringify(results),
                            video: postId,
                        });
                    }
                },
            );
        });

        app.get("/admin/videos", (req, res) => {
            res.render("admin/videos", {
                users: [],
                currentURL: "admin/videos",
            });
        });

        // Vend admin page
        app.get("/admin/vend", (req, res) => {
            res.render("admin/vend", {
                currentURL: "admin/vend",
                authToken: process.env.AUTHORIZATION || "",
            });
        });
    })
    .catch(err => {
        console.error("Failed to connect to database:", err);
    });

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
