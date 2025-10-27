# Porkbun DNS and API

## API Call examples

### Request List All Domains

```
curl -X POST https://api.porkbun.com/api/json/v3/domain/listAll \
  -H "Content-Type: application/json" \
  -d "{
    \"apikey\": \"$PORKBUN_API_KEY\",
    \"secretapikey\": \"$PORKBUN_SECRET_KEY\"
  }"
```

Response

```
{"status":"SUCCESS","domains":[{"domain":"dashanddata.com","status":"ACTIVE","tld":"com","createDate":"2021-09-14 09:40:58","expireDate":"2027-09-14 09:40:58","securityLock":"1","whoisPrivacy":"1","autoRenew":"1","notLocal":0},{"domain":"tu-rincon.com","status":"ACTIVE","tld":"com","createDate":"2023-03-30 08:06:07","expireDate":"2028-03-30 08:06:07","securityLock":"1","whoisPrivacy":"1","autoRenew":"1","notLocal":0}]}%
```

#### Needed for the /dns/registrar dropdown of domains:

- 1. domains.domain

### Request Create A Record

```
curl -X POST https://api.porkbun.com/api/json/v3/dns/create/tu-rincon.com \
  -H "Content-Type: application/json" \
  -d "{
    \"apikey\": \"<< process.env.PORKBUN_API_KEY >>\",
    \"secretapikey\": \"<< process.env.PORKBUN_SECRET_KEY >>\",
    \"name\": \"<< subdomain >>\",
    \"type\": \"<< type >>\",
    \"content\": \"<< content >>\",
    \"ttl\": \"<< ttl >>\"
  }"
```

Response

```
{"status":"SUCCESS","id":503023770}
```

#### Needed for the /dns/records To send this request:

- 1. << process.env.PORKBUN_API_KEY >> = the .env variable Porkbun API Key
- 2. << process.env.PORKBUN_SECRET_KEY >> = the .env variable Porkbun Secret Key
- 3. << subdomain >> = the subdomain you want to create
- 4. << type >> = the type of record you want to create
- 5. << content >> = the content of the record you want to create
- 6. << ttl >> = the ttl of the record you want to create

### Request Retrieve All Records

```
curl -X POST https://api.porkbun.com/api/json/v3/dns/retrieve/tu-rincon.com \
  -H "Content-Type: application/json" \
  -d "{
    \"apikey\": \"$PORKBUN_API_KEY\",
    \"secretapikey\": \"$PORKBUN_SECRET_KEY\"
  }"
```

Response

```
{"status":"SUCCESS","cloudflare":"enabled","records":[{"id":"503023665","name":"api.tu-rincon.com","type":"A","content":"69.207.163.8","ttl":"600","prio":"0","notes":""},{"id":"503023770","name":"test.dev.api.tu-rincon.com","type":"A","content":"69.207.163.8","ttl":"600","prio":"0","notes":""},{"id":"503023153","name":"tu-rincon.com","type":"A","content":"69.207.163.8","ttl":"600","prio":"0","notes":""},{"id":"503022938","name":"tu-rincon.com","type":"NS","content":"curitiba.porkbun.com","ttl":"86400","prio":null,"notes":null},{"id":"503022937","name":"tu-rincon.com","type":"NS","content":"fortaleza.porkbun.com","ttl":"86400","prio":null,"notes":null},{"id":"503022935","name":"tu-rincon.com","type":"NS","content":"maceio.porkbun.com","ttl":"86400","prio":null,"notes":null},{"id":"503022936","name":"tu-rincon.com","type":"NS","content":"salvador.porkbun.com","ttl":"86400","prio":null,"notes":null}]}
```

#### Needed for the /dns/records TableSubdomains:

- 1. records.name
- 2. records.type
- 3. records.content

## appendix

### Request Create A Record

```
curl -X POST https://api.porkbun.com/api/json/v3/dns/create/tu-rincon.com \
  -H "Content-Type: application/json" \
  -d "{
    \"apikey\": \"$PORKBUN_API_KEY\",
    \"secretapikey\": \"$PORKBUN_SECRET_KEY\",
    \"name\": \"api\",
    \"type\": \"A\",
    \"content\": \"69.207.163.8\",
    \"ttl\": \"600\"
  }"
```

Response

```
{"status":"SUCCESS","id":503023665}
```
