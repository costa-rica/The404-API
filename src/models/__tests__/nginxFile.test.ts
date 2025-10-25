import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { NginxFile } from "../nginxFile";
import { Machine } from "../machine";

describe("NginxFile Model", () => {
	let mongoServer: MongoMemoryServer;
	let appMachineId: mongoose.Types.ObjectId;
	let nginxMachineId: mongoose.Types.ObjectId;

	beforeAll(async () => {
		// Create in-memory MongoDB instance
		mongoServer = await MongoMemoryServer.create();
		const uri = mongoServer.getUri();

		await mongoose.connect(uri);

		// Create test machines
		const appMachine = await Machine.create({
			machineName: "test-app-machine",
			urlFor404Api: "http://localhost:3001",
			localIpAddress: "192.168.1.100",
		});

		const nginxMachine = await Machine.create({
			machineName: "test-nginx-machine",
			urlFor404Api: "http://localhost:3002",
			localIpAddress: "192.168.1.101",
			nginxStoragePathOptions: ["/etc/nginx/sites-available"],
		});

		appMachineId = appMachine._id as mongoose.Types.ObjectId;
		nginxMachineId = nginxMachine._id as mongoose.Types.ObjectId;
	});

	afterAll(async () => {
		// Clean up test data
		await NginxFile.deleteMany({});
		await Machine.deleteMany({});
		await mongoose.connection.close();
		await mongoServer.stop();
	});

	afterEach(async () => {
		// Clean up nginx files after each test
		await NginxFile.deleteMany({});
	});

	test("should create a NginxFile document with all required fields", async () => {
		const nginxFile = await NginxFile.create({
			serverName: "example.com",
			portNumber: 3000,
			serverNameArrayOfAdditionalServerNames: ["www.example.com", "api.example.com"],
			appHostServerMachineId: appMachineId,
			nginxHostServerMachineId: nginxMachineId,
			framework: "ExpressJS",
			storeDirectory: "/etc/nginx/sites-available",
		});

		expect(nginxFile).toBeDefined();
		expect(nginxFile.serverName).toBe("example.com");
		expect(nginxFile.portNumber).toBe(3000);
		expect(nginxFile.serverNameArrayOfAdditionalServerNames).toHaveLength(2);
		expect(nginxFile.framework).toBe("ExpressJS");
		expect(nginxFile.storeDirectory).toBe("/etc/nginx/sites-available");
		expect(nginxFile.createdAt).toBeDefined();
		expect(nginxFile.updatedAt).toBeDefined();
	});

	test("should verify relationships with Machine collection work correctly", async () => {
		const nginxFile = await NginxFile.create({
			serverName: "test.com",
			portNumber: 8080,
			appHostServerMachineId: appMachineId,
			nginxHostServerMachineId: nginxMachineId,
		});

		// Populate the machine references
		const populatedFile = await NginxFile.findById(nginxFile._id)
			.populate("appHostServerMachineId")
			.populate("nginxHostServerMachineId");

		expect(populatedFile).toBeDefined();
		expect((populatedFile!.appHostServerMachineId as any).machineName).toBe("test-app-machine");
		expect((populatedFile!.nginxHostServerMachineId as any).machineName).toBe("test-nginx-machine");
	});

	test("should fail validation when required fields are missing", async () => {
		// Test missing serverName
		await expect(
			NginxFile.create({
				portNumber: 3000,
				appHostServerMachineId: appMachineId,
				nginxHostServerMachineId: nginxMachineId,
			})
		).rejects.toThrow();

		// Test missing portNumber
		await expect(
			NginxFile.create({
				serverName: "example.com",
				appHostServerMachineId: appMachineId,
				nginxHostServerMachineId: nginxMachineId,
			})
		).rejects.toThrow();

		// Test missing appHostServerMachineId
		await expect(
			NginxFile.create({
				serverName: "example.com",
				portNumber: 3000,
				nginxHostServerMachineId: nginxMachineId,
			})
		).rejects.toThrow();

		// Test missing nginxHostServerMachineId
		await expect(
			NginxFile.create({
				serverName: "example.com",
				portNumber: 3000,
				appHostServerMachineId: appMachineId,
			})
		).rejects.toThrow();
	});

	test("should allow optional fields to be omitted", async () => {
		const nginxFile = await NginxFile.create({
			serverName: "minimal.com",
			portNumber: 5000,
			appHostServerMachineId: appMachineId,
			nginxHostServerMachineId: nginxMachineId,
		});

		expect(nginxFile).toBeDefined();
		expect(nginxFile.framework).toBeUndefined();
		expect(nginxFile.storeDirectory).toBeUndefined();
		expect(nginxFile.serverNameArrayOfAdditionalServerNames).toHaveLength(0);
	});

	test("should allow same machine to be both app and nginx host", async () => {
		const nginxFile = await NginxFile.create({
			serverName: "localhost.com",
			portNumber: 3000,
			appHostServerMachineId: appMachineId,
			nginxHostServerMachineId: appMachineId, // Same machine for both
		});

		expect(nginxFile).toBeDefined();
		expect(nginxFile.appHostServerMachineId.toString()).toBe(nginxFile.nginxHostServerMachineId.toString());
	});
});
