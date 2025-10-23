# 🧩 Database Setup for The404-API

This project diverges from the default **TypeScriptExpressJsAPI02starter** database setup.  
While the starter project uses an external package (`TypeScriptDb`) for database access, **The404-API** implements its own **MongoDB** connection using **Mongoose**.  

## Overview

The404-API is part of **The 404 Server Manager** ecosystem.  
It connects to a shared MongoDB database (`The404v02`) that stores server, app, and configuration data.  
Each instance of The404-API runs on an individual Ubuntu server (port `8000`) and contributes to a shared data model.

## ✅ What to Change from the Starter

In this project, **remove any reference to the external `TypeScriptDb` package** and instead create a native Mongoose-based setup.

Your file structure for database integration should look like this:

```
src/
├── models/
│   ├── connection.ts
│   ├── user.ts
│   ├── machine.ts
│   └── (other models to be added later)
```

## 🔌 Connection Setup (`src/models/connection.ts`)

This file is responsible for establishing the MongoDB connection using Mongoose.

Example structure:

```typescript
import mongoose from "mongoose";

const connectDB = async () => {
	try {
		const uri = process.env.MONGODB_URI as string;
		if (!uri) throw new Error("Missing MONGODB_URI in environment variables.");

		await mongoose.connect(uri, {
			serverSelectionTimeoutMS: 2000,
		});

		console.log("[The404-API] MongoDB connected successfully");
	} catch (error) {
		console.error("[The404-API] MongoDB connection error:", error);
		process.exit(1);
	}
};

export default connectDB;
```

In `src/app.ts`, import and initialize the connection before loading any model files:

```typescript
import connectDB from "./models/connection";
connectDB();
```

## 🧱 Model Setup Pattern

Each model file (for example, `user.ts` or `machine.ts`) should:

1. **Import `mongoose`**  
2. **Define a schema** using `new mongoose.Schema()`  
3. **Create a model** using `mongoose.model()`  
4. **Export the model** for use in routes and controllers  

**Example (`machine.ts`):**

```typescript
import mongoose from "mongoose";

const machineSchema = new mongoose.Schema({
	machineName: { type: String, required: true },
	urlFor404Api: { type: String, required: true },
	localIpAddress: { type: String, required: true },
	userHomeDir: { type: String },
	nginxStoragePathOptions: [{ type: String }],
});

export const Machine = mongoose.model("Machine", machineSchema);
```

**Example (`user.ts`):**

```typescript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	toggleOnOffPermis: { type: Boolean, default: false },
});

export const User = mongoose.model("User", userSchema);
```

## 🧠 Notes for Claude Code

When generating the `CLAUDE.md` file:

- Recognize that **The404-API** does **not** use `TypeScriptDb`.  
- Follow the **Mongoose single-connection pattern** from `src/models/connection.ts`.  
- Use the **existing `users` and `machines` collections** from the original `The404Back` project.  
- Do **not** create other tables (such as pm2 apps or nginx configs) in the initial setup.  
- Prepare the schema and connection to be extended later for multi-machine and PM2 data synchronization.
