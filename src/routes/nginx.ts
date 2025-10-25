import express from "express";
import type { Request, Response } from "express";
import { authenticateToken } from "../modules/authentication";
import { NginxFile } from "../models/nginxFile";

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authenticateToken);

// 🔹 GET /nginx: Get all nginx config files
router.get("/", async (req: Request, res: Response) => {
	try {
		const nginxFiles = await NginxFile.find()
			.populate("appHostServerMachineId")
			.populate("nginxHostServerMachineId");

		res.json(nginxFiles);
	} catch (error) {
		console.error("Error fetching nginx files:", error);
		res.status(500).json({ error: "Failed to fetch nginx files" });
	}
});

export default router;
