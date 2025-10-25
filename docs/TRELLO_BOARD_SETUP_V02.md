# TRELLO_BOARD_SETUP_V02

This document defines the Trello board structure and initial task breakdown for **The 404 Server Manager** project (V2 setup).  
The board contains two lists:

- **The404-API To Do’s** → backend tasks for The404-API repository
- **The404-Web To Do’s** → frontend tasks for The404-Web repository

Each list’s cards are structured as actionable, trackable tasks that can be worked on independently and committed incrementally.

---

## The404-API To Do’s

### 🧩 MongoDB Schema and Relationships

- **Create NginxFiles collection schema**

  - Fields: `serverName`, `portNumber`, `serverNameArrayOfAdditionalServerNames`, `appHostServerMachineId`, `nginxHostServerMachineId`
  - Use `mongoose.Schema.Types.ObjectId` for the machine ID references
  - No enforced relationship — just store `_id` of corresponding machine documents

- **Define Mongoose model**

  - File: `src/models/nginxFile.ts`
  - Export model and interface (e.g. `INginxFileDocument`)

- **Implement machine linkage logic**
  - Ensure NginxFile creation includes:
    - API server’s machineName (from environment or DB)
    - API server’s local IP
    - IDs from Machine documents (fetched or received from client)

---

### ⚙️ Nginx Routes and Controller Logic

- **Create `nginxRouter.ts`**

  - Register under `/nginx` in `app.ts`
  - Import from new `src/routes/nginx.ts`

- **Implement `GET /nginx` endpoint**

  - Return all NginxFiles in the collection
  - Use `.populate()` for both `appHostServerMachineId` and `nginxHostServerMachineId`
  - Include error handling and JWT auth middleware

- **Implement `POST /nginx/create-config-file`**

  - Accept body: `serverNames[]`, `appHostServerMachineId`, `nginxHostServerMachineId`, `portNumber`, `framework`, `storeDirectory`
  - Generate Nginx config file using an existing template based on framework and directory
  - Save the new config file to the correct location (`/etc/nginx/sites-available` or `/etc/nginx/conf.d`)
  - Insert new document into NginxFiles collection

- **Add middleware for JWT verification**
  - Move common JWT verification to `/src/middleware/auth.ts`
  - Apply to `/nginx` routes and `/machines` routes

---

### 🧰 Supporting Logic and Utilities

- **Add filesystem helper module**

  - `src/utils/nginxFileWriter.ts`
  - Handles writing the template to the filesystem and logging output
  - Returns absolute file path or error

- **Template selector utility**
  - `src/utils/nginxTemplateSelector.ts`
  - Chooses the right nginx.conf template based on framework and config type

---

### 🧪 API Testing and Validation

- **Add integration tests**

  - Folder: `src/tests/nginxRoutes.test.ts`
  - Mock file creation and MongoDB write
  - Test 200 and error responses for both endpoints

- **Add Swagger / OpenAPI docs update**
  - Extend `/docs/API_REFERENCE.md` with `/nginx` routes
  - Include request/response schemas

---

## The404-Web To Do’s

### 🧭 Sidebar and Navigation Structure

- **Restructure AppSidebar**

  - Add new parent NavItem: `DNS`
  - SubItems:
    - `/dns/nginx`
    - `/dns/registrar`
  - Use consistent icon (GlobeIcon or equivalent from `@/icons`)

- **Ensure path integration**
  - Verify new pages are under `src/app/(dashboard)/dns/`

---

### 🧱 Redux and State Management

- **Create new `machineSlice.ts`**

  - Location: `src/store/features/machines/`
  - State structure:
    ```ts
    interface MachineState {
    	machinesArray: Machine[];
    	connectedMachine: Machine | null;
    }
    ```
  - Add reducers:
    - `setMachinesArray(payload: Machine[])`
    - `connectMachine(payload: Machine)`
  - Update `rootReducer` and `store/index.ts` (not persistent)

- **Update `userSlice.ts`**

  - Remove connected machine properties:
    - `machineName`, `urlFor404Api`, `localIpAddress`, `nginxStoragePathOptions`
  - Keep only: `token`, `username`, `email`, `isAdmin`

- **Update components referencing userSlice machine data**
  - `/servers/machines` page
  - `AppHeader` (use connectedMachine from machineSlice)
  - Any dependent fetch calls to use `connectedMachine.urlFor404Api`

---

### 🧮 DNS/Nginx Page Development

- **Create `/dns/nginx/page.tsx`**

  - Top section: form
    - Dropdown: Nginx host machine (machinesArray)
    - Dropdown: App host machine (machinesArray)
    - Input: Server names (+ add more)
    - Input: Port
    - Radio: App technology (ExpressJS, Next.js, Python)
    - Radio: Config store directory (from selected Nginx host)
  - Bottom section: table (`TableNginxFiles`)
    - Populate via GET `/nginx` endpoint

- **Create `TableNginxFiles` component**
  - Location: `src/components/tables/TableNginxFiles.tsx`
  - Displays server name, port, app host machine, nginx host machine, last modified
  - Fetches from The404-API `/nginx`

---

### 🌐 Registrar Page (Placeholder Setup)

- **Create `/dns/registrar/page.tsx`**
  - Placeholder UI with form and table structure
  - Form inputs: servername, IP address, TTL
  - Table: future integration with Porkbun API
  - Keep UI consistent with `dns/nginx`

---

### 🧩 General UI/UX and Styling

- **Ensure consistent use of terminal theme**

  - Follow `STYLE_GUIDE.md` (brand orange, phosphor green, etc.)
  - Buttons: `bg-brand-500 hover:bg-brand-600`
  - Inputs: `border-gray-300 dark:border-gray-700`

- **Verify responsiveness**
  - Sidebar collapse works
  - Form layout stacks on small screens
  - Tables remain scrollable horizontally

---

### 🧪 Frontend API Calls

- **Add `/dns/nginx` API helper functions**

  - File: `src/utils/api/nginx.ts`
  - Functions:
    - `getNginxFiles(token: string)`
    - `createNginxConfig(payload: CreateNginxConfigPayload, token: string)`

- **Integrate into React components**
  - Use `useAppSelector` to get token + connectedMachine
  - Handle loading and success states with `useState`

---

### 🧱 Testing and Validation

- **Manual integration test**

  - Create config via `/dns/nginx` form
  - Verify new row appears in the table
  - Confirm config file exists on `maestro03` under `/etc/nginx/sites-available`

- **UI QA**
  - Verify theme compliance
  - Check navigation persistence after refresh

---

### 📄 Documentation

- **Update README.md**

  - Add new routes `/dns/nginx`, `/dns/registrar`
  - Add notes about new reducers and slices

- **Add `dns/` section to CLAUDE_THE404_WEB.md**
  - Describe component structure and flow

---
