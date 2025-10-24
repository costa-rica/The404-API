import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export interface ManagedApp {
	name: string;
	pm_id: number;
	status: string;
	cpu: number;
	memory: number;
	uptime: number;
	restarts: number;
	script: string;
	exec_mode: string;
	instances: number;
	pid: number | null;
	version: string | null;
	node_version: string | null;
	port: number | null;
}

/**
 * Parse ecosystem.config.js file to extract port mappings
 * @returns Map of app name to port number
 */
export function parseEcosystemFile(): Map<string, number> {
	const portMap = new Map<string, number>();

	try {
		const ecosystemDir = process.env.PATH_PM2_ECOSYSTEM;
		if (!ecosystemDir) {
			console.warn("PATH_PM2_ECOSYSTEM not set in environment variables");
			return portMap;
		}

		// Append ecosystem.config.js to the directory path
		// path.join automatically handles trailing slashes
		const ecosystemPath = path.join(ecosystemDir, "ecosystem.config.js");

		if (!fs.existsSync(ecosystemPath)) {
			console.warn(`Ecosystem file not found at: ${ecosystemPath}`);
			return portMap;
		}

		const fileContent = fs.readFileSync(ecosystemPath, "utf8");

		// Extract apps array from the file
		// Pattern matches: apps: [ ... ]
		const appsMatch = fileContent.match(/apps\s*:\s*\[([\s\S]*?)\]\s*[,}]/);
		if (!appsMatch) {
			console.warn("Could not find apps array in ecosystem file");
			return portMap;
		}

		// Use a more robust approach: find all app name and PORT pairs
		// Match pattern: name: "AppName" ... PORT: 8001
		const appNameRegex = /name\s*:\s*['"](.*?)['"]/g;
		const appNames: string[] = [];

		let match;
		while ((match = appNameRegex.exec(fileContent)) !== null) {
			appNames.push(match[1]);
		}

		// For each app name, find its PORT value
		for (const appName of appNames) {
			// Find the section for this app (from "name: AppName" to the next app or end of array)
			const appStartPattern = new RegExp(`name\\s*:\\s*['"]${appName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'i');
			const appStartMatch = appStartPattern.exec(fileContent);

			if (!appStartMatch) continue;

			const startIndex = appStartMatch.index;
			// Find the next app or end of apps array
			const nextAppMatch = fileContent.slice(startIndex + 1).search(/}\s*,\s*{/);
			const endIndex = nextAppMatch !== -1 ? startIndex + 1 + nextAppMatch + 50 : fileContent.length;

			const appSection = fileContent.slice(startIndex, endIndex);

			// Extract PORT from this app's section
			const portMatch = appSection.match(/PORT\s*:\s*['"]?(\d+)['"]?\s*,?/);
			if (portMatch) {
				const port = parseInt(portMatch[1], 10);
				portMap.set(appName, port);
			}
		}

		console.log(`Parsed ${portMap.size} app port mappings from ecosystem file`);
	} catch (error) {
		console.error("Error parsing ecosystem file:", error);
	}

	return portMap;
}

/**
 * Get the port for an app from the ecosystem.config.js file
 * @param appName The name of the PM2 app
 * @param portMap Pre-parsed port mapping
 * @returns Port number or null if not found
 */
export function getAppPort(appName: string, portMap: Map<string, number>): number | null {
	return portMap.get(appName) || null;
}

/**
 * Parse raw PM2 JSON output into a cleaner format
 * @param rawApps Raw PM2 app data
 * @returns Array of ManagedApp objects
 */
export function parsePM2Output(rawApps: any[]): Omit<ManagedApp, "port">[] {
	return rawApps.map((app: any) => ({
		name: app.name,
		pm_id: app.pm_id,
		status: app.pm2_env?.status || "unknown",
		cpu: app.monit?.cpu || 0,
		memory: app.monit?.memory || 0,
		uptime: app.pm2_env?.pm_uptime || 0,
		restarts: app.pm2_env?.restart_time || 0,
		script: app.pm2_env?.pm_exec_path || "",
		exec_mode: app.pm2_env?.exec_mode || "fork",
		instances: app.pm2_env?.instances || 1,
		pid: app.pid || null,
		version: app.pm2_env?.version || null,
		node_version: app.pm2_env?.node_version || null,
	}));
}

/**
 * Get all PM2 managed applications with port information
 * @returns Array of ManagedApp objects with port numbers
 */
export async function getPM2Apps(): Promise<ManagedApp[]> {
	try {
		// Set PM2_HOME if provided in environment variables
		const pm2Home = process.env.PATH_PM2_HOME;
		const env = pm2Home ? { ...process.env, PM2_HOME: pm2Home } : process.env;

		// Execute pm2 jlist to get JSON output of all processes
		const { stdout, stderr } = await execAsync("pm2 jlist", { env });

		if (stderr && !stderr.includes("PM2")) {
			console.error("PM2 command error:", stderr);
		}

		// Parse the JSON output from PM2
		const rawApps = JSON.parse(stdout);
		const parsedApps = parsePM2Output(rawApps);

		// Parse ecosystem.config.js to get port mappings
		const portMap = parseEcosystemFile();

		// Add port information to each app
		const appsWithPorts = parsedApps.map((app) => {
			const port = getAppPort(app.name, portMap);
			return { ...app, port };
		});

		return appsWithPorts;
	} catch (error: any) {
		// If PM2 command fails, throw the error to be handled by the route
		throw error;
	}
}

/**
 * Toggle the status of a PM2 app (stop if online, start if stopped)
 * @param appName The name of the PM2 app
 * @returns Object with the app name and new status
 */
export async function toggleAppStatus(
	appName: string
): Promise<{ name: string; status: string; action: string }> {
	try {
		// Set PM2_HOME if provided in environment variables
		const pm2Home = process.env.PATH_PM2_HOME;
		const env = pm2Home ? { ...process.env, PM2_HOME: pm2Home } : process.env;

		// Get current status of the app
		const { stdout } = await execAsync("pm2 jlist", { env });
		const rawApps = JSON.parse(stdout);

		// Find the app by name
		const app = rawApps.find((a: any) => a.name === appName);
		if (!app) {
			throw new Error(`App "${appName}" not found`);
		}

		const currentStatus = app.pm2_env?.status || "unknown";
		let action: string;
		let command: string;

		// Determine action based on current status
		if (currentStatus === "online") {
			action = "stop";
			command = `pm2 stop "${appName}"`;
		} else if (currentStatus === "stopped") {
			action = "start";
			command = `pm2 start "${appName}"`;
		} else {
			// For errored, crashed, or unknown states, restart
			action = "restart";
			command = `pm2 restart "${appName}"`;
		}

		// Execute the PM2 command
		await execAsync(command, { env });

		// Get the new status
		const { stdout: newStdout } = await execAsync("pm2 jlist", { env });
		const newRawApps = JSON.parse(newStdout);
		const updatedApp = newRawApps.find((a: any) => a.name === appName);
		const newStatus = updatedApp?.pm2_env?.status || "unknown";

		return {
			name: appName,
			status: newStatus,
			action,
		};
	} catch (error: any) {
		throw error;
	}
}
