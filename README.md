# The 404 Server Manager API

This is a TypeScript Express.js API project. This is my starter project for all Express.js API projects.

## Database

**IMPORTANT**
See /docs/DATABASE_CONVERSION_OVERVIEW.md

- This project uses MongoDB with Mongoose.
- This project will remove the TypeScriptDb package and replace its implementation with Mongoose and the new structure provided in DATABASE_CONVERSION_OVERVIEW.md.

## Set up

1. clone TypeScriptExpressJsAPI02starter
2. Rename
3. implement the MongoDB database

```bash
npm install express
npm install --save-dev typescript ts-node nodemon @types/node @types/express
```

3. Create a `tsconfig.json` file (run `npx tsc --init` or manually make the file in root directory)

Modify tsconfig.json

```json
{
	"compilerOptions": {
		"module": "CommonJS",
		"moduleResolution": "node",
		"esModuleInterop": true,
		"verbatimModuleSyntax": false,
		"outDir": "./dist",
		"rootDir": "./src"
	}
}
```

4. Make src/ and app.ts

```bash
mkdir src
touch src/app.ts
```

5. package.json scripts

```json
  "dev": "nodemon --watch src --exec ts-node src/app.ts",
  "build": "tsc",
  "start": "node dist/app.js"
```

6. Run

- `npm run dev` to start the development server
- `npm run build` to build the project, then `npm start` to start the production server
