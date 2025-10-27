import express from "express";
import type { Request, Response } from "express";
import { authenticateToken } from "../modules/authentication";
import fs from "fs";
import path from "path";

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authenticateToken);

// 🔹 GET /admin/downloads: List all files in status_reports directory
router.get("/downloads", async (req: Request, res: Response) => {
	try {
		const statusReportsDir = path.join(
			process.env.PATH_PROJECT_RESOURCES || "",
			"status_reports"
		);

		// Check if directory exists
		if (!fs.existsSync(statusReportsDir)) {
			return res.status(404).json({
				error: "Status reports directory not found",
				path: statusReportsDir,
			});
		}

		// Read directory contents
		const files = await fs.promises.readdir(statusReportsDir);

		// Get file details (name, size, modified date)
		const fileDetails = await Promise.all(
			files.map(async (fileName) => {
				const filePath = path.join(statusReportsDir, fileName);
				const stats = await fs.promises.stat(filePath);

				return {
					fileName,
					size: stats.size,
					sizeKB: (stats.size / 1024).toFixed(2),
					modifiedDate: stats.mtime,
					isFile: stats.isFile(),
				};
			})
		);

		// Filter to only include files (not directories)
		const filesOnly = fileDetails.filter((file) => file.isFile);

		res.json({
			directory: statusReportsDir,
			fileCount: filesOnly.length,
			files: filesOnly,
		});
	} catch (error) {
		console.error("Error listing download files:", error);
		res.status(500).json({ error: "Failed to list download files" });
	}
});

// 🔹 GET /admin/downloads/:filename: Download a specific file
router.get("/downloads/:filename", async (req: Request, res: Response) => {
	try {
		const { filename } = req.params;

		// Validate filename (prevent directory traversal)
		if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
			return res.status(400).json({ error: "Invalid filename" });
		}

		const statusReportsDir = path.join(
			process.env.PATH_PROJECT_RESOURCES || "",
			"status_reports"
		);

		const filePath = path.join(statusReportsDir, filename);

		// Check if file exists
		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ error: "File not found" });
		}

		// Check if it's a file (not a directory)
		const stats = await fs.promises.stat(filePath);
		if (!stats.isFile()) {
			return res.status(400).json({ error: "Not a file" });
		}

		// Set headers for file download
		res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
		res.setHeader("Content-Type", "application/octet-stream");
		res.setHeader("Content-Length", stats.size);

		// Stream the file
		const fileStream = fs.createReadStream(filePath);
		fileStream.pipe(res);

		fileStream.on("error", (error) => {
			console.error("Error streaming file:", error);
			if (!res.headersSent) {
				res.status(500).json({ error: "Failed to download file" });
			}
		});
	} catch (error) {
		console.error("Error downloading file:", error);
		if (!res.headersSent) {
			res.status(500).json({ error: "Failed to download file" });
		}
	}
});

export default router;
