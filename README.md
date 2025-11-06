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

## .env

- workstation

```
APP_NAME=The404-API
PORT=3000
JWT_SECRET=SECRET_KEY
ADMIN_EMAIL=["nrodrig1@gmail.com"]
PROJECT_RESOURCES=/Users/nick/Documents/_project_resources/The404-API
MONGODB_URI=mongodb+srv://nrodrig1:SECRET_KEY@cluster0.8puct.mongodb.net/The404v02
ADMIN_NODEMAILER_EMAIL_ADDRESS="nrodrig1@gmail.com"
ADMIN_NODEMAILER_EMAIL_PASSWORD="SECRET_KEY"
URL_THE404_WEB=https://the404.dashanddata.com/
PATH_PM2_ECOSYSTEM=/Users/nick/Documents/_testData/ecosystem.config.js
PATH_PM2_HOME=/Users/nick/.pm2
PORKBUN_API_KEY=SECRET_KEY
PORKBUN_SECRET_KEY=SECRET_KEY
PATH_PROJECT_RESOURCES=/Users/nick/Documents/_project_resources/The404-API
PATH_ETC_NGINX_SITES_AVAILABLE=/Users/nick/Documents/_testData/nginx/sites-available
```
