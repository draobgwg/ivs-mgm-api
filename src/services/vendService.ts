import database from "../database/connection";

/**
 * Simple in-memory service to manage the current vend state.
 * If long-term persistence is required, replace the in-memory
 * variable with a database implementation.
 */
class VendService {
    private connection: any;

    constructor() {
        this.connection = database.pool;
    }

    /**
     * Fetch current vend state from DB. If no row exists, initialize one with 0.
     */
    public async getVendState(): Promise<number> {
        const query = "SELECT vend_status FROM vend ORDER BY id DESC LIMIT 1";
        return new Promise((resolve, reject) => {
            this.connection.query(query, [], async (error, results) => {
                if (error) {
                    return reject(error);
                }
                if (results.length === 0) {
                    // Initialize row with 0
                    try {
                        await this.insertVendRow(0);
                        return resolve(0);
                    } catch (e) {
                        return reject(e);
                    }
                }
                return resolve(results[0].vend_status);
            });
        });
    }

    /**
     * Update vend state to 0 or 1 in DB.
     */
    public async setVendState(state: number): Promise<void> {
        const safeState = state === 1 ? 1 : 0;
        console.log(state,"state")
        const updateQuery =
            "UPDATE vend SET vend_status=?, updated_at=NOW() ORDER BY id DESC LIMIT 1";
        return new Promise((resolve, reject) => {
            this.connection.query(updateQuery, [safeState], async (err, res) => {
                if (err) {
                    return reject(err);
                }
                if (res.affectedRows === 0) {
                    try {
                        await this.insertVendRow(safeState);
                        return resolve();
                    } catch (e) {
                        return reject(e);
                    }
                }
                return resolve();
            });
        });
    }

    /**
     * Reset vend state to 0.
     */
    public async resetVendState(): Promise<void> {
        return this.setVendState(0);
    }

    private insertVendRow(state: number): Promise<void> {
        const insertQuery =
            "INSERT INTO vend (vend_status) VALUES (?)";
        return new Promise((resolve, reject) => {
            this.connection.query(insertQuery, [state], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    }
}

export default new VendService();
