# Build the /dns/registrar page

## List: API dns/registrar

### Card 1: Create Porkbun API Service Module

**Description:**
Create a reusable service module to handle all Porkbun API interactions with proper error handling and TypeScript types.

- there are existing .env variables for Porkbun API Key (PORKBUN_API_KEY) and Secret Key (PORKBUN_SECRET_KEY)

**Tasks:**

- [ ] Create `src/modules/porkbunService.ts`
- [ ] Define TypeScript interfaces for Porkbun request/response types
- [ ] Implement `listAllDomains()` method
- [ ] Implement `createDnsRecord(domain, recordData)` method
- [ ] Implement `retrieveDnsRecords(domain)` method
- [ ] Add proper error handling for API failures
- [ ] Add request/response logging for debugging

### Card 2: Create GET /dns/domains Endpoint

**Description:**
Create an API endpoint that fetches and returns the list of all domains from Porkbun.

**Tasks:**

- [ ] Create `src/routes/registrar.ts` router file
- [ ] Implement `GET /registrar/domains` endpoint
- [ ] Call `porkbunService.listAllDomains()`
- [ ] Return formatted response with domain list
- [ ] Add error handling for Porkbun API failures
- [ ] Register router in `src/app.ts`

**Acceptance Criteria:**

- Endpoint returns JSON array of domains
- Response format: `{ success: true, domains: [{ domain: string, status: string, ... }] }`
- Returns 500 error with message if Porkbun API fails
- Endpoint appears in API documentation
