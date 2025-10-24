# API Reference

This document provides comprehensive documentation for all available API endpoints in the The404-API API.

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
- [Machine Routes](#machine-routes)

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

### POST /users/request-reset-password-email

Request a password reset email. Sends an email with a JWT token that expires in 1 hour.

**Authentication:** Not required

**Request Body:**

```json
{
	"email": "user@example.com"
}
```

**Request Example:**

```bash
curl --location 'http://localhost:3000/users/request-reset-password-email' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "user@example.com"
}'
```

**Success Response (200 OK):**

```json
{
	"message": "Email sent successfully"
}
```

**Error Responses:**

**400 Bad Request - Missing Email:**

```json
{
	"error": "Email is required."
}
```

**404 Not Found - User Not Found:**

```json
{
	"error": "User not found."
}
```

---

### POST /users/reset-password-with-new-password

Reset user password using the token from the reset email.

**Authentication:** Not required (uses JWT token from email)

**Request Body:**

```json
{
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"newPassword": "newSecurePassword123"
}
```

**Request Example:**

```bash
curl --location 'http://localhost:3000/users/reset-password-with-new-password' \
--header 'Content-Type: application/json' \
--data-raw '{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "newSecurePassword123"
}'
```

**Success Response (200 OK):**

```json
{
	"message": "Password reset successfully"
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**

```json
{
	"error": "Missing token, newPassword"
}
```

**401 Unauthorized - Invalid Token:**

```json
{
	"error": "Invalid or expired token."
}
```

**401 Unauthorized - Expired Token:**

```json
{
	"error": "Reset token has expired."
}
```

**404 Not Found - User Not Found:**

```json
{
	"error": "User not found."
}
```

**500 Internal Server Error:**

```json
{
	"error": "Internal server error"
}
```

---

## Machine Routes

### GET /machines/name

Get the current machine's hostname and local IP address using OS-level information.

**Authentication:** Not required

**Request:**

```http
GET /machines/name HTTP/1.1
Host: localhost:3000
```

**Request Example:**

```bash
curl --location 'http://localhost:3000/machines/name'
```

**Success Response (200 OK):**

```json
{
	"machineName": "ubuntu-server-01",
	"localIpAddress": "192.168.1.100"
}
```

**Error Response (500 Internal Server Error):**

```json
{
	"error": "Failed to retrieve machine information"
}
```

---

### GET /machines

Get all registered machines in the system.

**Authentication:** Required (JWT token)

**Request:**

```http
GET /machines HTTP/1.1
Host: localhost:3000
Authorization: Bearer <your_jwt_token>
```

**Request Example:**

```bash
curl --location 'http://localhost:3000/machines' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Success Response (200 OK):**

```json
{
	"result": true,
	"existingMachines": [
		{
			"_id": "507f1f77bcf86cd799439011",
			"machineName": "ubuntu-server-01",
			"urlFor404Api": "http://192.168.1.100:8000",
			"localIpAddress": "192.168.1.100",
			"userHomeDir": "/home/ubuntu",
			"nginxStoragePathOptions": ["/var/www", "/home/user/sites"],
			"createdAt": "2025-10-23T10:30:00.000Z",
			"updatedAt": "2025-10-23T10:30:00.000Z"
		}
	]
}
```

**Error Responses:**

**401 Unauthorized - Missing or Invalid Token:**

```json
{
	"error": "Access denied. No token provided."
}
```

---

### POST /machines

Register a new machine in the system. Automatically adds the machine name and local IP address from OS.

**Authentication:** Not required

**Request Body:**

```json
{
	"urlFor404Api": "http://192.168.1.100:8000",
	"nginxStoragePathOptions": ["/var/www", "/home/user/sites"],
	"userHomeDir": "/home/ubuntu"
}
```

**Request Example:**

```bash
curl --location 'http://localhost:3000/machines' \
--header 'Content-Type: application/json' \
--data-raw '{
  "urlFor404Api": "http://192.168.1.100:8000",
  "nginxStoragePathOptions": ["/var/www", "/home/user/sites"],
  "userHomeDir": "/home/ubuntu"
}'
```

**Success Response (201 Created):**

```json
{
	"message": "Machine created successfully",
	"machine": {
		"id": "507f1f77bcf86cd799439011",
		"machineName": "ubuntu-server-01",
		"urlFor404Api": "http://192.168.1.100:8000",
		"localIpAddress": "192.168.1.100",
		"userHomeDir": "/home/ubuntu",
		"nginxStoragePathOptions": ["/var/www", "/home/user/sites"],
		"createdAt": "2025-10-23T10:30:00.000Z",
		"updatedAt": "2025-10-23T10:30:00.000Z"
	}
}
```

**Error Responses:**

**400 Bad Request - Missing Fields:**

```json
{
	"error": "Missing urlFor404Api, nginxStoragePathOptions, userHomeDir"
}
```

**400 Bad Request - Invalid Array:**

```json
{
	"error": "nginxStoragePathOptions must be an array of strings"
}
```

**500 Internal Server Error:**

```json
{
	"error": "Failed to create machine"
}
```

---

### DELETE /machines/:id

Delete a machine from the system by its ID.

**Authentication:** Required (JWT token)

**URL Parameters:**

- `id` (string, required) - MongoDB ObjectId of the machine to delete

**Request:**

```http
DELETE /machines/507f1f77bcf86cd799439011 HTTP/1.1
Host: localhost:3000
Authorization: Bearer <your_jwt_token>
```

**Request Example:**

```bash
curl --location --request DELETE 'http://localhost:3000/machines/507f1f77bcf86cd799439011' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Success Response (200 OK):**

```json
{
	"message": "Machine deleted successfully"
}
```

**Error Responses:**

**401 Unauthorized - Missing or Invalid Token:**

```json
{
	"error": "Access denied. No token provided."
}
```

**404 Not Found - Machine Not Found:**

```json
{
	"error": "Machine not found"
}
```

**500 Internal Server Error:**

```json
{
	"error": "Failed to delete machine"
}
```

---
