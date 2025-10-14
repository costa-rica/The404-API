import app from "./app"; // Import the configured app

const PORT = parseInt(process.env.PORT || "3000", 10);
const APP_NAME = process.env.APP_NAME || "ExpressAPI02"; // Fallback if APP_NAME is undefined

// Override console.log and console.error to include the app name
console.log = (
	(log) => (message: any) =>
		log(`[${APP_NAME}] ${message}`)
)(console.log);

console.error = (
	(log) => (message: any) =>
		log(`[${APP_NAME}] ${message}`)
)(console.error);

// Capture stack traces for errors
process.on("uncaughtException", (err: Error) => {
	console.error("There is an error");
	console.error(`Uncaught Exception: ${err.message}`);
	console.error(`Stack Trace:\n${err.stack}`);
	process.exit(1); // Exit the process to avoid undefined behavior
});

process.on("unhandledRejection", (reason: unknown, promise: Promise<any>) => {
	console.error(`Unhandled Rejection at:`, promise);
	if (reason instanceof Error) {
		console.error(`Reason: ${reason.message}`);
		console.error(`Stack Trace:\n${reason.stack}`);
	} else {
		console.error(`Reason:`, reason);
	}
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server running on http://0.0.0.0:${PORT}`);
});
