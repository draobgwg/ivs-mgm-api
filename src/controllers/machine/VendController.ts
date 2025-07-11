import { Request, Response } from "express";
import vendService from "../../services/vendService";
import dotenv from "dotenv";

dotenv.config();

const AUTH_TOKEN = process.env.AUTHORIZATION

class VendController {
    status = async (req: Request, res: Response) => {
        if (req.query.authorization !== AUTH_TOKEN) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        try {
            const vend = await vendService.getVendState();
            return res.json({ vend });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    };

    complete = async (req: Request, res: Response) => {
        if (req.query.authorization !== AUTH_TOKEN) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Expect body: { "vend-complete": 0 | 1 }
        const requestedStateRaw = req.body["vend-complete"];
        const requestedState = Number(requestedStateRaw) === 1 ? 1 : 0; // default to 0 for any invalid value

        try {
            await vendService.setVendState(requestedState);
            return res.json({ success: true, vend: requestedState });
        } catch (error) {
            return res.status(500).json({ error: (error as Error).message });
        }
    };
}

export default new VendController();
