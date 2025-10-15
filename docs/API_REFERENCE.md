# API Reference

This document provides comprehensive documentation for all available API endpoints in the TypeScriptExpressJsAPI02Starter API.

## Base URL

```
http://localhost:3000
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

- [Index Routes](#index-routes)
- [User Routes](#user-routes)

---

## Index Routes

### GET /

Serves the main HTML page.

**Authentication:** Not required

**Request:**

```http
GET / HTTP/1.1
Host: localhost:3000
```

**Success Response (200 OK):**

```html
<!DOCTYPE html>
<html>
	<!-- HTML content -->
</html>
```

**Error Response (500 Internal Server Error):**

```json
{
	"error": "Internal server error"
}
```

---

## User Routes

### GET /users

Returns a simple message indicating the users endpoint is available.

**Authentication:** Not required

**Request:**

```http
GET /users HTTP/1.1
Host: localhost:3000
```

**Success Response (200 OK):**

```
users endpoint
```

---

### POST /users/register

Register a new user account.

**Authentication:** Not required

**Request Body:**

```json
{
	"email": "user@example.com",
	"password": "securePassword123"
}
```

**Request Example:**

```bash
curl --location 'http://localhost:3000/users/register' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "user@example.com",
  "password": "securePassword123"
}'
```

**Success Response (201 Created):**

```json
{
	"message": "User created successfully",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"user": {
		"username": "user",
		"email": "user@example.com"
	}
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**

```json
{
	"error": "Missing email, password"
}
```

**400 Bad Request - User Already Exists:**

```json
{
	"error": "User already exists"
}
```

---

### POST /users/login

Authenticate and log in an existing user.

**Authentication:** Not required

**Request Body:**

```json
{
	"email": "user@example.com",
	"password": "securePassword123"
}
```

**Request Example:**

```bash
curl --location 'http://localhost:3000/users/login' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "user@example.com",
  "password": "securePassword123"
}'
```

**Success Response (200 OK):**

```json
{
	"message": "User logged in successfully",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"user": {
		"username": "user",
		"email": "user@example.com",
		"isAdmin": false
	}
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**

```json
{
	"error": "Missing email, password"
}
```

**400 Bad Request - User Not Found:**

```json
{
	"error": "User not found"
}
```

**400 Bad Request - Invalid Password:**

```json
{
	"error": "Invalid password"
}
```

---
