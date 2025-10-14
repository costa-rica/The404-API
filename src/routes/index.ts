import express from "express";
import type { Request, Response } from "express";
import path from "path";
import fs from "fs";

const router = express.Router();

// router.get("/", (req: Request, res: Response) => {
//   res.send("index endpoint");
// });

router.get("/", (req: Request, res: Response) => {
	console.log("index endpoint called 🚀");

	try {
		// Use the compiled template path at runtime
		const templatePath = path.resolve(__dirname, "../templates/index.html");
		let html = fs.readFileSync(templatePath, "utf8");

		res.type("html").send(html);
	} catch (err) {
		console.error("Error serving index page:", err);
		res.status(500).json({ error: "Internal server error" });
	}
});

export default router;
