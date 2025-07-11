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

        // If body has { "vend-complete": 1 } then vend is completed -> reset state to 0.
        // Otherwise ("vend-complete": 0) set state to 1 indicating machine is vending.
        const vendCompleteRaw = req.body["vend-complete"];
        const isComplete = Number(vendCompleteRaw) === 1;
        const newState = isComplete ? 0 : 1;

        try {
            await vendService.setVendState(newState);
            return res.json({ success: true, vend: newState });
        } catch (error) {
            return res.status(500).json({ error: (error as Error).message });
        }
    };
}

export default new VendController();
