# Porkbun DNS and API

## API Call examples

Request Create A Record

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

Request Create A Record

```
curl -X POST https://api.porkbun.com/api/json/v3/dns/create/tu-rincon.com \
  -H "Content-Type: application/json" \
  -d "{
    \"apikey\": \"$PORKBUN_API_KEY\",
    \"secretapikey\": \"$PORKBUN_SECRET_KEY\",
    \"name\": \"test.dev.api\",
    \"type\": \"A\",
    \"content\": \"69.207.163.8\",
    \"ttl\": \"600\"
  }"
```

Response

```
{"status":"SUCCESS","id":503023770}
```

Request Retrieve All Records

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
