import express from "express";
import type { Request, Response } from "express";
import { authenticateToken } from "../modules/authentication";
import { checkBodyReturnMissing } from "../modules/common";

const router = express.Router();

// 🔹 GET /registrar/get-all-porkbun-domains: Fetch all domains from Porkbun
router.get("/get-all-porkbun-domains", authenticateToken, async (req: Request, res: Response) => {
	try {
		// Validate environment variables
		if (!process.env.PORKBUN_API_KEY || !process.env.PORKBUN_SECRET_KEY) {
			return res.status(500).json({
				error: "Porkbun API credentials not configured",
			});
		}

		// Make request to Porkbun API
		const response = await fetch(
			"https://api.porkbun.com/api/json/v3/domain/listAll",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					apikey: process.env.PORKBUN_API_KEY,
					secretapikey: process.env.PORKBUN_SECRET_KEY,
				}),
			}
		);

		if (!response.ok) {
			return res.status(response.status).json({
				error: "Failed to fetch domains from Porkbun",
			});
		}

		const data = await response.json();

		// Check if the request was successful
		if (data.status !== "SUCCESS") {
			return res.status(500).json({
				error: "Porkbun API returned non-success status",
				details: data,
			});
		}

		// Transform the response to only include domain and status
		const domainsArray = data.domains.map(
			(domain: { domain: string; status: string }) => ({
				domain: domain.domain,
				status: domain.status,
			})
		);

		res.json({ domainsArray });
	} catch (error) {
		console.error("Error fetching Porkbun domains:", error);
		res.status(500).json({
			error: "Internal server error",
		});
	}
});

// 🔹 POST /registrar/create-subdomain: Create a DNS subdomain record on Porkbun
router.post("/create-subdomain", authenticateToken, async (req: Request, res: Response) => {
	try {
		const { domain, subdomain, publicIpAddress, type } = req.body;

		// Validate required fields
		const { isValid, missingKeys } = checkBodyReturnMissing(req.body, [
			"domain",
			"subdomain",
			"publicIpAddress",
			"type",
		]);

		if (!isValid) {
			return res.status(400).json({ error: `Missing ${missingKeys.join(", ")}` });
		}

		// Validate environment variables
		if (!process.env.PORKBUN_API_KEY || !process.env.PORKBUN_SECRET_KEY) {
			return res.status(500).json({
				error: "Porkbun API credentials not configured",
			});
		}

		// Make request to Porkbun API
		const response = await fetch(
			`https://api.porkbun.com/api/json/v3/dns/create/${domain}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					apikey: process.env.PORKBUN_API_KEY,
					secretapikey: process.env.PORKBUN_SECRET_KEY,
					name: subdomain,
					type: type,
					content: publicIpAddress,
					ttl: "600",
				}),
			}
		);

		if (!response.ok) {
			return res.status(response.status).json({
				error: "Failed to create subdomain on Porkbun",
			});
		}

		const data = await response.json();

		// Check if the request was successful
		if (data.status !== "SUCCESS") {
			return res.status(500).json({
				error: "Porkbun API returned non-success status",
				details: data,
			});
		}

		res.status(201).json({
			message: "Subdomain created successfully",
			recordId: data.id,
			domain,
			subdomain,
			type,
			publicIpAddress,
			ttl: 600,
		});
	} catch (error) {
		console.error("Error creating subdomain on Porkbun:", error);
		res.status(500).json({
			error: "Internal server error",
		});
	}
});

export default router;
