import os from "os";

// Helper function to get machine name and local IP address
function getMachineInfo(): { machineName: string; localIpAddress: string } {
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

	return { machineName, localIpAddress };
}

export { getMachineInfo };
