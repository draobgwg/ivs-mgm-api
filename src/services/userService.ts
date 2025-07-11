import { UserForm } from "../interfaces/commonInterfaces";
import database from "../database/connection";
export class UserService {
    private connection: any;

    constructor() {
        this.connection = database.pool;
    }

    async updateCode() {
        for (let i = 0; i < 5000; i++) {
            const code = await this.generateUniqueCode(6);
            const query = "INSERT INTO codes (code) VALUES (?)";
            const values = [code];

            new Promise((resolve, reject) => {
                this.connection.query(query, values, (error, results) => {
                    if (error) {
                        //reject(error);
                    } else {
                        //  resolve(1);
                    }
                });
            });
        }
    }

    async updateUserForm(userData): Promise<UserForm> {
        const code = await this.getCode();
        const query =
            "INSERT INTO users (name, email, phone_number, organization, title) VALUES (?, ?, ?, ?, ?)";
        const values = [
            userData.name,
            userData.email,
            userData.phone_number,
            userData.organization,
            userData.title,
        ];

        return new Promise((resolve, reject) => {
            this.connection.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ id: results.insertId, ...userData, code });
                }
            });
        });
    }

    async verifyCode(code): Promise<Boolean> {
        const query = "select count(*) as count from codes where code = ? ";
        const values = [code];

        return new Promise((resolve, reject) => {
            this.connection.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0].count);
                }
            });
        });
    }

    async markCodeUsed(code): Promise<Boolean> {
        const query = "update codes set is_used=1 where code = ?";
        const values = [code];

        return new Promise((resolve, reject) => {
            this.connection.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.affectedRows);
                }
            });
        });
    }

    async markCodeUsedCodesTbl(code): Promise<Boolean> {
        const query = "update codes set is_used=1 where code = ? and is_used=0";
        const values = [code];

        return new Promise((resolve, reject) => {
            this.connection.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.affectedRows);
                }
            });
        });
    }

    async login(loginForm): Promise<Boolean> {
        const query =
            "select * from users where users.email=? and users.role=1 ";
        const values = [loginForm.email];

        return new Promise((resolve, reject) => {
            this.connection.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            });
        });
    }

    async generateUniqueCode(length: number = 10): Promise<string> {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";

        for (let i = 0; i < length; i++) {
            code += characters.charAt(
                Math.floor(Math.random() * characters.length),
            );
        }

        const query = "SELECT COUNT(*) AS count FROM users WHERE code = ?";

        return new Promise((resolve, reject) => {
            this.connection.query(query, [code], async (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    const count = results[0].count;
                    if (count > 0) {
                        // Code already exists, generate a new one
                        resolve(this.generateUniqueCode(length));
                    } else {
                        resolve(code);
                    }
                }
            });
        });
    }

    async exportUsers(req): Promise<UserForm> {
        const startRange = req.query.startRange;
        const completeRange = req.query.completeRange;

        let query = "select * from users where users.role=2 ";

        if (startRange && completeRange) {
            query += ` and created_ts BETWEEN '${startRange}' AND '${completeRange}' `;
        }
        return new Promise((resolve, reject) => {
            this.connection.query(query, [], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    async getCode(): Promise<string> {
        const query = "SELECT code FROM codes WHERE is_used=0 limit 1";

        return new Promise((resolve, reject) => {
            this.connection.query(query, async (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    const code = results[0].code;

                    this.markCodeUsedCodesTbl(code);
                    resolve(code);
                }
            });
        });
    }

    async users(req): Promise<{ users: UserForm[]; total: Number }> {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const sortColumn = req.query.column;
        const sortDirection = req.query.direction;
        const startRange = req.query.startRange;
        const completeRange = req.query.completeRange + " 23:59:59";

        let SQLquery = `SELECT id, name, email, phone_number, organization, title, created_ts FROM users
        where role=2`;
        if (startRange && completeRange) {
            SQLquery += ` and created_ts BETWEEN '${startRange}' AND '${completeRange}' `;
        }

        if (sortColumn && sortDirection) {
            SQLquery += ` ORDER BY ${sortColumn} ${sortDirection}`;
        }
        SQLquery += ` LIMIT ${limit} OFFSET ${offset}`;
        console.log(SQLquery);
        const values = [];
        return new Promise((resolve, reject) => {
            this.connection.query(SQLquery, values, (error, results) => {
                if (error) {
                    reject(false);
                } else {
                    let sqlQueryCount = `SELECT COUNT(*) as total FROM users  where role=2`;
                    if (startRange && completeRange) {
                        sqlQueryCount += ` and created_ts BETWEEN '${startRange}' AND '${completeRange}' `;
                    }
                    this.connection.query(sqlQueryCount, (err, totalResult) => {
                        if (error) {
                            reject(false);
                        } else {
                            resolve({
                                users: results,
                                total: totalResult[0].total,
                            });
                        }
                    });
                }
            });
        });
    }

    // ... other methods for CRUD operations
}
