import express from "express";
import type { Request, Response } from "express";
import { authenticateToken } from "../modules/authentication";
import { NginxFile } from "../models/nginxFile";
import { Machine } from "../models/machine";
import { checkBodyReturnMissing } from "../modules/common";
import { verifyTemplateFileExists } from "../utils/fileValidation";
import { parseNginxConfig } from "../modules/parseNginxConfig";
import { getMachineInfo } from "../modules/machines";
import { createNginxConfigFromTemplate } from "../modules/nginx";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

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

// 🔹 GET /nginx/scan-nginx-dir: Scan nginx directory and parse config files
router.get("/scan-nginx-dir", async (req: Request, res: Response) => {
	try {
		// 1. Get current machine's local IP
		const { localIpAddress: currentMachineIp } = getMachineInfo();

		// 2. Look up nginxHostServerMachineId using current IP
		const nginxHostMachine = await Machine.findOne({
			localIpAddress: currentMachineIp,
		});
		if (!nginxHostMachine) {
			return res.status(404).json({
				error: "Current machine not found in database",
				currentIp: currentMachineIp,
			});
		}

		// 3. Read files from /etc/nginx/sites-available/
		const nginxDir = process.env.PATH_ETC_NGINX_SITES_AVAILABLE;
		let files: string[];

		try {
			files = await fs.promises.readdir(nginxDir);
		} catch (error) {
			return res.status(500).json({
				error: `Failed to read nginx directory: ${nginxDir}`,
				details: error instanceof Error ? error.message : "Unknown error",
			});
		}

		// 4. Filter out 'default'
		const configFiles = files.filter((file) => file !== "default");

		// 5. Parse each file
		const newEntries = [];
		const duplicates = [];
		const errors = [];

		for (const file of configFiles) {
			try {
				const filePath = path.join(nginxDir, file);
				const content = await fs.promises.readFile(filePath, "utf-8");
				const parsed = parseNginxConfig(content);

				// Skip if no server names found
				if (parsed.serverNames.length === 0) {
					errors.push({
						fileName: file,
						error: "No server names found in config file",
					});
					continue;
				}

				// Look up appHostServerMachineId
				let appHostMachine = null;
				if (parsed.localIpAddress) {
					appHostMachine = await Machine.findOne({
						localIpAddress: parsed.localIpAddress,
					});
				}

				// Check for duplicates by primary server name
				const primaryServerName = parsed.serverNames[0];
				const existing = await NginxFile.findOne({
					serverName: primaryServerName,
				});

				if (existing) {
					duplicates.push({
						fileName: file,
						serverName: primaryServerName,
						additionalServerNames: parsed.serverNames.slice(1),
						portNumber: parsed.listenPort,
						localIpAddress: parsed.localIpAddress,
						framework: parsed.framework,
						reason: "Server name already exists in database",
					});
				} else {
					// Prepare new entry data
					const newEntryData = {
						serverName: primaryServerName,
						serverNameArrayOfAdditionalServerNames: parsed.serverNames.slice(1),
						portNumber: parsed.listenPort || 0,
						appHostServerMachineId: appHostMachine?._id || null,
						nginxHostServerMachineId: nginxHostMachine._id,
						framework: parsed.framework,
						storeDirectory: nginxDir,
					};

					// Insert into database
					const createdEntry = await NginxFile.create(newEntryData);

					newEntries.push({
						fileName: file,
						serverName: primaryServerName,
						additionalServerNames: parsed.serverNames.slice(1),
						portNumber: parsed.listenPort,
						localIpAddress: parsed.localIpAddress,
						framework: parsed.framework,
						appHostMachineFound: !!appHostMachine,
						databaseId: createdEntry._id,
					});
				}
			} catch (error) {
				errors.push({
					fileName: file,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}

		// 6. Return response
		res.json({
			scanned: configFiles.length,
			new: newEntries.length,
			duplicates: duplicates.length,
			errors: errors.length,
			currentMachineIp,
			nginxHostMachineId: nginxHostMachine._id,
			newEntries,
			duplicateEntries: duplicates,
			errorEntries: errors,
		});
	} catch (error) {
		console.error("Error scanning nginx directory:", error);
		res.status(500).json({ error: "Failed to scan nginx directory" });
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
			return res
				.status(400)
				.json({ error: `Missing ${missingKeys.join(", ")}` });
		}

		const {
			templateFileName,
			serverNamesArray,
			appHostServerMachineId,
			portNumber,
			saveDestination,
		} = req.body;

		// Validate templateFileName (string)
		if (
			typeof templateFileName !== "string" ||
			templateFileName.trim() === ""
		) {
			return res
				.status(400)
				.json({ error: "templateFileName must be a non-empty string" });
		}

		// Validate serverNamesArray (array of strings)
		if (!Array.isArray(serverNamesArray) || serverNamesArray.length === 0) {
			return res
				.status(400)
				.json({ error: "serverNamesArray must be a non-empty array" });
		}

		if (
			!serverNamesArray.every(
				(name) => typeof name === "string" && name.trim() !== ""
			)
		) {
			return res
				.status(400)
				.json({ error: "All server names must be non-empty strings" });
		}

		// Validate appHostServerMachineId (valid ObjectId)
		if (!mongoose.Types.ObjectId.isValid(appHostServerMachineId)) {
			return res
				.status(400)
				.json({ error: "appHostServerMachineId must be a valid ObjectId" });
		}

		// Verify machine exists in database
		const machine = await Machine.findById(appHostServerMachineId);
		if (!machine) {
			return res
				.status(400)
				.json({
					error: "Machine with specified appHostServerMachineId not found",
				});
		}

		// Validate portNumber (number, 1-65535)
		if (
			typeof portNumber !== "number" ||
			portNumber < 1 ||
			portNumber > 65535
		) {
			return res
				.status(400)
				.json({ error: "portNumber must be a number between 1 and 65535" });
		}

		// Validate saveDestination (must be 'sites-available' or 'conf.d')
		if (saveDestination !== "sites-available" && saveDestination !== "conf.d") {
			return res
				.status(400)
				.json({
					error: "saveDestination must be either 'sites-available' or 'conf.d'",
				});
		}

		// Verify template file exists
		const fileValidation = verifyTemplateFileExists(templateFileName);
		if (!fileValidation.exists) {
			return res.status(400).json({ error: fileValidation.error });
		}

		// Get current machine's IP to find nginxHostServerMachineId
		const { localIpAddress: currentMachineIp } = getMachineInfo();
		const nginxHostMachine = await Machine.findOne({
			localIpAddress: currentMachineIp,
		});

		if (!nginxHostMachine) {
			return res.status(404).json({
				error: "Current machine not found in database",
				currentIp: currentMachineIp,
			});
		}

		// Machine document already validated and fetched above (line 217)
		// Use it to get the local IP address
		if (!machine.localIpAddress) {
			return res.status(400).json({
				error: "Machine document does not have a localIpAddress field",
			});
		}

		// Create nginx config file from template
		const configResult = await createNginxConfigFromTemplate({
			templateFilePath: fileValidation.fullPath!,
			serverNamesArray,
			localIpAddress: machine.localIpAddress,
			portNumber,
			saveDestination,
		});

		if (!configResult.success) {
			return res.status(500).json({
				error: "Failed to create nginx config file",
				details: configResult.error,
			});
		}

		// Determine framework (default to ExpressJs)
		// Note: Could be enhanced to detect framework from template or request
		const framework = "ExpressJs";

		// Determine storeDirectory based on saveDestination
		const storeDirectory =
			saveDestination === "sites-available"
				? "/etc/nginx/sites-available"
				: "/etc/nginx/conf.d";

		// Create NginxFile database record
		const nginxFileRecord = await NginxFile.create({
			serverName: serverNamesArray[0],
			serverNameArrayOfAdditionalServerNames: serverNamesArray.slice(1),
			portNumber,
			appHostServerMachineId,
			nginxHostServerMachineId: nginxHostMachine._id,
			framework,
			storeDirectory,
		});

		res.status(201).json({
			message: "Nginx config file created successfully",
			filePath: configResult.filePath,
			databaseRecord: nginxFileRecord,
		});
	} catch (error) {
		console.error("Error creating nginx config file:", error);
		res.status(500).json({ error: "Failed to create nginx config file" });
	}
});

// 🔹 DELETE /nginx/clear: Clear all nginx files from database
router.delete("/clear", async (req: Request, res: Response) => {
	try {
		const result = await NginxFile.deleteMany({});

		res.json({
			message: "NginxFiles collection cleared successfully",
			deletedCount: result.deletedCount,
		});
	} catch (error) {
		console.error("Error clearing nginx files:", error);
		res.status(500).json({ error: "Failed to clear nginx files" });
	}
});

export default router;
