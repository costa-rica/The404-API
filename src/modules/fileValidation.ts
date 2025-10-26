import fs from "fs";
import path from "path";

/**
 * Verifies that a template file exists in the project resources directory
 * @param templateFileName - Name of the template file (should end with .txt)
 * @returns Object with exists boolean and error message if applicable
 */
export function verifyTemplateFileExists(templateFileName: string): {
	exists: boolean;
	error?: string;
	fullPath?: string;
} {
	const projectResourcesPath = process.env.PATH_PROJECT_RESOURCES;

	if (!projectResourcesPath) {
		return {
			exists: false,
			error: "PATH_PROJECT_RESOURCES environment variable is not set",
		};
	}

	const templateDir = path.join(projectResourcesPath, "createTemplateFiles");

	// Check if template directory exists
	if (!fs.existsSync(templateDir)) {
		return {
			exists: false,
			error: `Template directory does not exist: ${templateDir}`,
		};
	}

	// Ensure template file has .txt extension
	if (!templateFileName.endsWith(".txt")) {
		return {
			exists: false,
			error: "Template file must have .txt extension",
		};
	}

	const fullPath = path.join(templateDir, templateFileName);

	// Check if template file exists
	if (!fs.existsSync(fullPath)) {
		return {
			exists: false,
			error: `Template file not found: ${templateFileName}`,
		};
	}

	// Check if it's a file (not a directory)
	const stats = fs.statSync(fullPath);
	if (!stats.isFile()) {
		return {
			exists: false,
			error: `Template path is not a file: ${templateFileName}`,
		};
	}

	return {
		exists: true,
		fullPath,
	};
}
