import database from "../database/connection";
export class UploadService {
    private connection: any;

    constructor() {
        this.connection = database.pool;
    }

    async uploadVideo(video) {
        const query = "INSERT INTO videos (name, mime) VALUES (?, ?)";
        const values = [video.filename, video.mimetype];

        return new Promise((resolve, reject) => {
            this.connection.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ id: results.insertId });
                }
            });
        });
    }

    async isOptInPostMedia(id, isOpt): Promise<Boolean> {
        const query = "update videos set is_opt_in_post_media=? where id = ?";
        const values = [isOpt, id];

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

    async videos(req): Promise<{ videos: any; total: Number }> {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const sortColumn = req.query.column;
        const sortDirection = req.query.direction;
        const startRange = req.query.startRange;
        const completeRange = req.query.completeRange + " 23:59:59";

        let SQLquery = `SELECT id, name, is_opt_in_post_media, video_feed, created_ts FROM videos where 1=1 `;
        if (startRange && completeRange) {
            SQLquery += ` and created_ts BETWEEN '${startRange}' AND '${completeRange}' `;
        }

        if (sortColumn && sortDirection) {
            SQLquery += ` ORDER BY ${sortColumn} ${sortDirection}`;
        } else {
            SQLquery += ` ORDER BY created_ts desc`;
        }
        SQLquery += ` LIMIT ${limit} OFFSET ${offset}`;
        console.log(SQLquery);
        const values = [];
        return new Promise((resolve, reject) => {
            this.connection.query(SQLquery, values, (error, results) => {
                if (error) {
                    reject(false);
                } else {
                    let sqlQueryCount = `SELECT COUNT(*) as total FROM videos  where 1=1 `;
                    if (startRange && completeRange) {
                        sqlQueryCount += ` and created_ts BETWEEN '${startRange}' AND '${completeRange}' `;
                    }
                    this.connection.query(sqlQueryCount, (err, totalResult) => {
                        if (error) {
                            reject(false);
                        } else {
                            resolve({
                                videos: results,
                                total: totalResult[0].total,
                            });
                        }
                    });
                }
            });
        });
    }

    async updateVideoFeedStatus(id, isActive): Promise<Boolean> {
        const query = "update videos set video_feed=? where id = ?";
        const values = [isActive, id];
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

    // ... other methods for CRUD operations
}
