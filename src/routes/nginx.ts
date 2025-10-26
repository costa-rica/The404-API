import express from "express";
import type { Request, Response } from "express";
import { authenticateToken } from "../modules/authentication";
import { NginxFile } from "../models/nginxFile";
import { Machine } from "../models/machine";
import { checkBodyReturnMissing } from "../modules/common";
import { verifyTemplateFileExists } from "../utils/fileValidation";
import mongoose from "mongoose";

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

// 🔹 POST /nginx/create-config-file: Create nginx configuration file
router.post("/create-config-file", async (req: Request, res: Response) => {
	try {
		// Validate required fields
		const { isValid, missingKeys } = checkBodyReturnMissing(req.body, [
			"templateFileName",
			"serverNamesArray",
			"appHostServerMachineId",
			"portNumber",
			"saveDestination",
		]);

		if (!isValid) {
			return res.status(400).json({ error: `Missing ${missingKeys.join(", ")}` });
		}

		const {
			templateFileName,
			serverNamesArray,
			appHostServerMachineId,
			portNumber,
			saveDestination,
		} = req.body;

		// Validate templateFileName (string)
		if (typeof templateFileName !== "string" || templateFileName.trim() === "") {
			return res.status(400).json({ error: "templateFileName must be a non-empty string" });
		}

		// Validate serverNamesArray (array of strings)
		if (!Array.isArray(serverNamesArray) || serverNamesArray.length === 0) {
			return res.status(400).json({ error: "serverNamesArray must be a non-empty array" });
		}

		if (!serverNamesArray.every((name) => typeof name === "string" && name.trim() !== "")) {
			return res.status(400).json({ error: "All server names must be non-empty strings" });
		}

		// Validate appHostServerMachineId (valid ObjectId)
		if (!mongoose.Types.ObjectId.isValid(appHostServerMachineId)) {
			return res.status(400).json({ error: "appHostServerMachineId must be a valid ObjectId" });
		}

		// Verify machine exists in database
		const machine = await Machine.findById(appHostServerMachineId);
		if (!machine) {
			return res.status(400).json({ error: "Machine with specified appHostServerMachineId not found" });
		}

		// Validate portNumber (number, 1-65535)
		if (typeof portNumber !== "number" || portNumber < 1 || portNumber > 65535) {
			return res.status(400).json({ error: "portNumber must be a number between 1 and 65535" });
		}

		// Validate saveDestination (must be 'sites-available' or 'conf.d')
		if (saveDestination !== "sites-available" && saveDestination !== "conf.d") {
			return res.status(400).json({ error: "saveDestination must be either 'sites-available' or 'conf.d'" });
		}

		// Verify template file exists
		const fileValidation = verifyTemplateFileExists(templateFileName);
		if (!fileValidation.exists) {
			return res.status(400).json({ error: fileValidation.error });
		}

		// If we get here, all validation passed
		// TODO: Pass to template processing module (Part 2)
		res.status(200).json({
			message: "Validation successful",
			validated: {
				templateFileName,
				serverNamesArray,
				appHostServerMachineId,
				portNumber,
				saveDestination,
				templatePath: fileValidation.fullPath,
			},
		});
	} catch (error) {
		console.error("Error creating nginx config file:", error);
		res.status(500).json({ error: "Failed to create nginx config file" });
	}
});

export default router;
