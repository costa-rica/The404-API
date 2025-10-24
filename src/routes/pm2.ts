import express from "express";
import type { Request, Response } from "express";
import { authenticateToken } from "../modules/authentication";
import { getPM2Apps, toggleAppStatus } from "../modules/pm2";
import path from "path";
import fs from "fs";

const router = express.Router();

// 🔹 GET /pm2/apps: Get all PM2 managed applications
router.get("/apps", authenticateToken, async (req: Request, res: Response) => {
	try {
		const managedAppsArray = await getPM2Apps();
		res.json({ managedAppsArray });
	} catch (error: any) {
		console.error("Error getting PM2 apps:", error);

		// Check if PM2 is not installed or not running
		if (error.message?.includes("command not found") || error.code === 127) {
			return res.status(503).json({
				error: "PM2 is not installed or not available",
				managedAppsArray: [],
			});
		}

		// Return empty array if PM2 is running but has no apps
		if (error.message?.includes("Process not found")) {
			return res.json({ managedAppsArray: [] });
		}

		// Handle JSON parse errors
		if (error instanceof SyntaxError) {
			return res.status(500).json({
				error: "Failed to parse PM2 output",
				managedAppsArray: [],
			});
		}

		res.status(500).json({
			error: "Failed to retrieve PM2 applications",
			managedAppsArray: [],
		});
	}
});

// 🔹 POST /pm2/toggle-app-status/:name: Toggle PM2 app status (start/stop)
router.post(
	"/toggle-app-status/:name",
	authenticateToken,
	async (req: Request, res: Response) => {
		try {
			const { name } = req.params;

			if (!name) {
				return res.status(400).json({ error: "App name is required" });
			}

			const result = await toggleAppStatus(name);

			res.json({
				message: `App ${result.action}ed successfully`,
				app: {
					name: result.name,
					status: result.status,
					action: result.action,
				},
			});
		} catch (error: any) {
			console.error("Error toggling app status:", error);

			// App not found
			if (error.message?.includes("not found")) {
				return res.status(404).json({
					error: error.message,
				});
			}

			// PM2 command errors
			if (error.message?.includes("command not found") || error.code === 127) {
				return res.status(503).json({
					error: "PM2 is not installed or not available",
				});
			}

			res.status(500).json({
				error: "Failed to toggle app status",
			});
		}
	}
);

// 🔹 GET /pm2/logs/:appName: Get PM2 app logs
router.get("/logs/:appName", authenticateToken, async (req, res) => {
	try {
		const { appName } = req.params;
		const type = req.query.type === "err" ? "error" : "out";
		const lines = parseInt(req.query.lines as string) || 500;

		// const logPath = path.join(
		// 	process.env.PATH_PM2_HOME,
		// 	`.pm2/logs/${appName}-${type}.log`
		// );
		const pm2Home =
			process.env.PATH_PM2_HOME || process.env.HOME || "/home/ubuntu";
		const logPath = path.join(pm2Home, `logs/${appName}-${type}.log`);

		if (!fs.existsSync(logPath)) {
			return res.status(404).json({ error: "Log file not found" });
		}

		// Read only the tail (for performance)
		const content = fs.readFileSync(logPath, "utf8");
		const linesArray = content.trim().split("\n");
		const lastLines = linesArray.slice(-lines);

		return res.json({ appName, type, lines: lastLines });
	} catch (err) {
		console.error("Error reading log:", err);
		return res.status(500).json({ error: "Failed to read log file" });
	}
});

export default router;
