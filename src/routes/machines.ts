import express from "express";
import type { Request, Response } from "express";
import os from "os";

const router = express.Router();

// 🔹 GET /machines/name: Get machine name and local IP address
router.get("/name", (req: Request, res: Response) => {
	try {
		// Get machine hostname
		const machineName = os.hostname();

		// Get network interfaces
		const networkInterfaces = os.networkInterfaces();
		let localIpAddress = "";

		// Find the first non-internal IPv4 address
		for (const interfaceName in networkInterfaces) {
			const interfaces = networkInterfaces[interfaceName];
			if (!interfaces) continue;

			for (const iface of interfaces) {
				// Skip internal (i.e., 127.0.0.1) and non-IPv4 addresses
				if (iface.family === "IPv4" && !iface.internal) {
					localIpAddress = iface.address;
					break;
				}
			}

			if (localIpAddress) break;
		}

		// If no external IPv4 found, fallback to localhost
		if (!localIpAddress) {
			localIpAddress = "127.0.0.1";
		}

		res.json({
			machineName,
			localIpAddress,
		});
	} catch (error) {
		console.error("Error getting machine info:", error);
		res.status(500).json({ error: "Failed to retrieve machine information" });
	}
});

export default router;
