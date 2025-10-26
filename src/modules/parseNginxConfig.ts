/**
 * Nginx configuration file parser
 * Extracts server names, ports, IPs, and framework information from nginx config files
 */

export interface ParsedNginxConfig {
	serverNames: string[];
	listenPort: number | null;
	localIpAddress: string | null;
	framework: string;
}

/**
 * Parse nginx configuration file content
 * @param content - The raw content of the nginx config file
 * @returns Parsed configuration data
 */
export function parseNginxConfig(content: string): ParsedNginxConfig {
	const result: ParsedNginxConfig = {
		serverNames: [],
		listenPort: null,
		localIpAddress: null,
		framework: "ExpressJs", // Default framework
	};

	// Extract server_name(s)
	// Pattern: server_name domain1.com domain2.com;
	const serverNameRegex = /server_name\s+([^;]+);/g;
	let match;

	while ((match = serverNameRegex.exec(content)) !== null) {
		const names = match[1]
			.trim()
			.split(/\s+/)
			.filter((name) => name && name !== "");
		result.serverNames.push(...names);
	}

	// Remove duplicates from server names
	const uniqueNames: string[] = [];
	const seen: { [key: string]: boolean } = {};
	for (const name of result.serverNames) {
		if (!seen[name]) {
			seen[name] = true;
			uniqueNames.push(name);
		}
	}
	result.serverNames = uniqueNames;

	// Extract proxy_pass IP and port
	// Pattern: proxy_pass http://192.168.100.17:8001;
	const proxyPassRegex = /proxy_pass\s+http:\/\/([0-9.]+):(\d+);/;
	const proxyMatch = content.match(proxyPassRegex);

	if (proxyMatch) {
		result.localIpAddress = proxyMatch[1];
		result.listenPort = parseInt(proxyMatch[2], 10);
	}

	// Detect framework based on presence of "location /static {"
	if (/location\s+\/static\s*{/.test(content)) {
		result.framework = "Next.js / Python";
	}

	return result;
}
