# 📖 API Reference

Complete API documentation for the Digital E-Commerce Backend.

---

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Response Format](#response-format)
5. [Error Codes](#error-codes)
6. [Rate Limiting](#rate-limiting)
7. [Endpoints](#endpoints)
   - [Authentication](#authentication-endpoints)
   - [User Management](#user-management-endpoints)
   - [Wallet](#wallet-endpoints)
   - [Payments](#payment-endpoints)

---

## Overview

The Digital E-Commerce API is a RESTful API that uses JSON for request and response payloads.

### API Information

- **Version**: 0.2.1
- **Base URL**: `http://localhost:5000` (development)
- **Production URL**: `https://your-domain.com`
- **Supported Languages**: English (en), Vietnamese (vi)

---

## Base URL

```
Development: http://localhost:5000
Production:  https://your-domain.com
```

All endpoints are prefixed with `/api`:

```
GET /api/auth/me
POST /api/wallet/add-funds
```

---

## Authentication

### Bearer Token

Most endpoints require authentication using JWT (JSON Web Tokens).

**Header Format**:

```
Authorization: Bearer {your_jwt_token}
```

**Token Types**:

- **Access Token**: Short-lived (7 days), used for API requests
- **Refresh Token**: Long-lived (30 days), used to obtain new access tokens

**Example**:

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:5000/api/users/me
```

### Obtaining Tokens

Tokens are obtained through:

1. **Registration**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`
3. **Refresh**: `POST /api/auth/refresh-token`

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "statusCode": 400,
    "details": {
      // Additional error details
    }
  }
}
```

### Pagination Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "totalItems": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## Error Codes

| Status Code | Meaning                                  |
| ----------- | ---------------------------------------- |
| `200`       | OK - Request successful                  |
| `201`       | Created - Resource created successfully  |
| `400`       | Bad Request - Invalid input              |
| `401`       | Unauthorized - Authentication required   |
| `403`       | Forbidden - Insufficient permissions     |
| `404`       | Not Found - Resource not found           |
| `409`       | Conflict - Resource already exists       |
| `422`       | Unprocessable Entity - Validation failed |
| `429`       | Too Many Requests - Rate limit exceeded  |
| `500`       | Internal Server Error - Server error     |

### Common Error Messages

```json
// Authentication Error
{
  "success": false,
  "message": "Please authenticate to access this resource",
  "error": {
    "statusCode": 401
  }
}

// Validation Error
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "statusCode": 400,
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}

// Not Found Error
{
  "success": false,
  "message": "User not found",
  "error": {
    "statusCode": 404
  }
}
```

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Header**: `X-RateLimit-Remaining`
- **Reset Time**: Header `X-RateLimit-Reset`

**Rate Limit Exceeded Response**:

```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "error": {
    "statusCode": 429
  }
}
```

---

## Endpoints

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint**: `POST /api/auth/register`  
**Authentication**: Not required

**Request Body**:

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "preferredLanguage": "en"
}
```

**Validation Rules**:

- `username`: 3-30 characters, alphanumeric + underscore
- `email`: Valid email format
- `password`: Min 8 characters, must contain uppercase, lowercase, and number
- `preferredLanguage`: Optional, `en` or `vi` (default: `en`)

**Success Response** (201):

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": false,
      "createdAt": "2026-02-08T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:

```json
// Email already exists (409)
{
  "success": false,
  "message": "User already exists with this email",
  "error": {
    "statusCode": 409
  }
}

// Validation error (400)
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "statusCode": 400,
    "details": {
      "password": "Password must be at least 8 characters"
    }
  }
}
```

---

### Login

Authenticate user and receive tokens.

**Endpoint**: `POST /api/auth/login`  
**Authentication**: Not required

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200):

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**:

```json
// Invalid credentials (401)
{
  "success": false,
  "message": "Invalid email or password",
  "error": {
    "statusCode": 401
  }
}
```

---

### Get Current User

Get authenticated user's profile.

**Endpoint**: `GET /api/auth/me`  
**Authentication**: Required

**Headers**:

```
Authorization: Bearer {token}
```

**Success Response** (200):

```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": true,
      "preferredLanguage": "en",
      "createdAt": "2026-01-15T10:30:00.000Z"
    }
  }
}
```

---

### Refresh Token

Obtain new access token using refresh token.

**Endpoint**: `POST /api/auth/refresh-token`  
**Authentication**: Not required

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200):

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Logout

Invalidate user's session.

**Endpoint**: `POST /api/auth/logout`  
**Authentication**: Required

**Success Response** (200):

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Forgot Password

Request password reset email.

**Endpoint**: `POST /api/auth/forgot-password`  
**Authentication**: Not required

**Request Body**:

```json
{
  "email": "john@example.com"
}
```

**Success Response** (200):

```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### Reset Password

Reset password using reset token.

**Endpoint**: `POST /api/auth/reset-password/:token`  
**Authentication**: Not required

**Request Body**:

```json
{
  "password": "NewSecurePass123!"
}
```

**Success Response** (200):

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## User Management Endpoints

### Get User Profile

Get user's profile information.

**Endpoint**: `GET /api/users/profile`  
**Authentication**: Required

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": true,
      "preferredLanguage": "en",
      "wallet": {
        "balance": 1000000,
        "currency": "VND"
      },
      "createdAt": "2026-01-15T10:30:00.000Z"
    }
  }
}
```

---

### Update Profile

Update user's profile information.

**Endpoint**: `PATCH /api/users/profile`  
**Authentication**: Required

**Request Body**:

```json
{
  "username": "johndoe_updated",
  "preferredLanguage": "vi"
}
```

**Success Response** (200):

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe_updated",
      "email": "john@example.com",
      "preferredLanguage": "vi"
    }
  }
}
```

---

### Change Password

Change user's password.

**Endpoint**: `POST /api/users/change-password`  
**Authentication**: Required

**Request Body**:

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass123!"
}
```

**Success Response** (200):

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Wallet Endpoints

### Get Wallet Balance

Get current wallet balance and information.

**Endpoint**: `GET /api/wallet`  
**Authentication**: Required

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "wallet": {
      "id": "507f1f77bcf86cd799439012",
      "balance": 1500000,
      "currency": "VND",
      "user": "507f1f77bcf86cd799439011",
      "isActive": true,
      "lastTransactionAt": "2026-02-08T10:30:00.000Z"
    }
  }
}
```

---

### Add Funds

Add funds to wallet (create payment link).

**Endpoint**: `POST /api/wallet/add-funds`  
**Authentication**: Required

**Request Body**:

```json
{
  "amount": 100000,
  "description": "Add funds to wallet"
}
```

**Validation**:

- `amount`: Minimum 10,000 VND, maximum 50,000,000 VND

**Success Response** (200):

```json
{
  "success": true,
  "message": "Payment link created",
  "data": {
    "paymentLink": "https://pay.payos.vn/web/...",
    "orderId": "ORD-1234567890",
    "amount": 100000,
    "expiresAt": "2026-02-08T11:30:00.000Z"
  }
}
```

---

### Get Transaction History

Get wallet transaction history.

**Endpoint**: `GET /api/wallet/transactions`  
**Authentication**: Required

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `type`: Filter by type (`credit`, `debit`, `all`)
- `startDate`: Filter from date (ISO format)
- `endDate`: Filter to date (ISO format)

**Example**:

```
GET /api/wallet/transactions?page=1&limit=20&type=credit
```

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "507f1f77bcf86cd799439013",
        "type": "credit",
        "amount": 100000,
        "balance": 1600000,
        "description": "Wallet top-up via PayOS",
        "status": "completed",
        "createdAt": "2026-02-08T10:30:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439014",
        "type": "debit",
        "amount": 50000,
        "balance": 1550000,
        "description": "Payment for order #12345",
        "status": "completed",
        "createdAt": "2026-02-07T15:20:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "totalItems": 45,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### Transfer Funds

Transfer funds to another user's wallet.

**Endpoint**: `POST /api/wallet/transfer`  
**Authentication**: Required

**Request Body**:

```json
{
  "recipientEmail": "recipient@example.com",
  "amount": 50000,
  "description": "Payment for service"
}
```

**Validation**:

- `amount`: Must be positive, less than or equal to current balance
- `recipientEmail`: Must be valid, verified user

**Success Response** (200):

```json
{
  "success": true,
  "message": "Transfer successful",
  "data": {
    "transaction": {
      "id": "507f1f77bcf86cd799439015",
      "amount": 50000,
      "recipient": "recipient@example.com",
      "newBalance": 1450000,
      "description": "Payment for service",
      "createdAt": "2026-02-08T10:35:00.000Z"
    }
  }
}
```

**Error Responses**:

```json
// Insufficient balance (400)
{
  "success": false,
  "message": "Insufficient wallet balance",
  "error": {
    "statusCode": 400
  }
}

// Recipient not found (404)
{
  "success": false,
  "message": "Recipient user not found",
  "error": {
    "statusCode": 404
  }
}
```

---

## Payment Endpoints

### Payment Webhook

PayOS webhook endpoint for payment status updates.

**Endpoint**: `POST /api/payment/webhook`  
**Authentication**: PayOS signature verification

**Note**: This endpoint is called by PayOS, not by clients.

**Webhook Payload** (from PayOS):

```json
{
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": 1234567890,
    "amount": 100000,
    "description": "Add funds",
    "accountNumber": "1234567890",
    "reference": "FT22348229384",
    "transactionDateTime": "2026-02-08T10:30:00.000Z"
  },
  "signature": "..."
}
```

---

## Admin Endpoints (Role: admin)

### Get All Users

List all users (admin only).

**Endpoint**: `GET /api/admin/users`  
**Authentication**: Required (Admin)

**Query Parameters**:

- `page`: Page number
- `limit`: Items per page
- `role`: Filter by role
- `search`: Search by username/email

**Success Response** (200):

```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {...}
  }
}
```

---

### Add Points to Wallet

Add points to user's wallet (admin/staff only).

**Endpoint**: `POST /api/admin/wallet/add-points`  
**Authentication**: Required (Admin/Staff)

**Request Body**:

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "amount": 100000,
  "description": "Promotional bonus"
}
```

**Success Response** (200):

```json
{
  "success": true,
  "message": "Points added successfully",
  "data": {
    "transaction": {
      "amount": 100000,
      "newBalance": 1550000
    }
  }
}
```

---

## Testing with cURL

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Profile (with auth)

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Add Funds

```bash
curl -X POST http://localhost:5000/api/wallet/add-funds \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "description": "Add funds"
  }'
```

---

## Testing with Postman

1. **Import Collection**: Create a new collection in Postman
2. **Set Base URL**: Use environment variable `{{baseUrl}}`
3. **Set Token**: Store token in environment variable `{{token}}`
4. **Add Auth**: Use "Bearer Token" type with `{{token}}`

**Example Environment**:

```json
{
  "baseUrl": "http://localhost:5000",
  "token": "your_jwt_token_here"
}
```

---

## Internationalization

The API supports multiple languages. Specify language preference:

**Methods**:

1. **User preference**: Set during registration or update profile
2. **Header**: `Accept-Language: vi` or `Accept-Language: en`
3. **Query parameter**: `?lang=vi`

**Example**:

```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer TOKEN" \
  -H "Accept-Language: vi"
```

**Response** (Vietnamese):

```json
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công",
  "data": {...}
}
```

---

## Webhooks

### PayOS Webhook Configuration

Configure webhook URL in PayOS dashboard:

```
https://your-domain.com/api/payment/webhook
```

**Security**: PayOS sends signature in request that is automatically verified.

---

## SDK Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:5000';
let token = '';

// Register
async function register() {
  const response = await axios.post(`${API_URL}/api/auth/register`, {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'SecurePass123!',
  });

  token = response.data.data.token;
  return response.data;
}

// Get Profile
async function getProfile() {
  const response = await axios.get(`${API_URL}/api/users/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// Add Funds
async function addFunds(amount) {
  const response = await axios.post(
    `${API_URL}/api/wallet/add-funds`,
    { amount, description: 'Add funds' },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}
```

---

## Support

For issues or questions:

- 📖 Documentation: [/docs](/docs)
- 🐛 Report Issues: [GitHub Issues](https://github.com/devnguyen0111/Digital-Ecommerce-BE/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/devnguyen0111/Digital-Ecommerce-BE/discussions)

---

**API Version**: 0.2.1  
**Last Updated**: February 2026  
**Maintained by**: devnguyen0111
