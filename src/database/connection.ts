import mysql2 from "mysql2";
require("dotenv").config();

const pool = mysql2.createPool({
    host: process.env.HOST, // Replace with your database host
    user: process.env.DB_USER, // Replace with your database user
    password: process.env.PASSWORD, // Replace with your database password
    database: process.env.DB, // Replace with your database name
    connectionLimit: 5, // Adjust as needed
    waitForConnections: true,
    multipleStatements: true,
});
const env = process.env.ENV;

function connectDB(retries: number = 3): Promise<void> {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                if (retries > 0) {
                    console.error(
                        `Failed to connect to database. Retrying (${retries})...`,
                    );
                    setTimeout(() => {
                        connectDB(retries - 1)
                            .then(resolve)
                            .catch(reject);
                    }, 2000); // Adjust retry interval as needed
                } else {
                    reject(err);
                }
            } else {
                connection.release();
                resolve();
            }
        });
    });
}

export default {
    pool,
    connectDB,
};
