# Rurblist

Rurblist is a online real estate market place designed to both streamline property search and make empowers realtors to showcase their professionalism, building a reputation that clients can trust.

Features are apartment listing, detailed home search, user authentication.

The platform is built with making access to dream home with just a click, making it suitable for all home searchers and realtors.

Rurblist aim to bridge the gap between realtors and clients, fostering a community that values connection, trust, and growth.

# User Authentication and Management System Documentation

```js
// Advisable for frontend developer to store this information as a constant for ease of update
// BASE_URL = "https://rurblist-server.onrender.com"
```

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Project Structure](#project-structure)
4. [Functionality](#functionality)
   1. [User Registration](#user-registration)
   2. [User Login](#user-login)
   3. [Forgot Password](#forgot-password)
   4. [Reset Password](#reset-password)
   5. [Admin User Management](#admin-user-management)
5. [Current Features](#current-features)
6. [Issues and Areas for Improvement](#issues-and-areas-for-improvement)
   1. [Security Considerations](#security-considerations)
   2. [Missing Features](#missing-features)
   3. [Error Handling](#error-handling)
   4. [CORS](#cors)
7. [What Needs to be Changed](#what-needs-to-be-changed)
8. [Future Enhancements](#future-enhancements)

---

## Project Overview

This project is a **User Authentication and Management System** built using **Node.js**, **Express**, **MongoDB**, and **JWT** for handling user authentication and management. It supports:

- User Registration
- User Login
- Password Reset (Forgot and Reset Password)
- Admin functionalities for managing users.

The system allows users to register, login, and reset passwords, while admins can manage users' data, including viewing, updating, and deleting users. Security is a priority, with password hashing and token-based authentication for secure sessions.

---

## Technologies Used

- **Node.js**: JavaScript runtime for building the server.
- **Express**: Web framework for handling routes and middleware.
- **MongoDB**: NoSQL database for storing user data.
- **JWT (JSON Web Token)**: Used for user authentication via tokens.
- **Nodemailer**: For sending emails (e.g., password reset and welcome emails).
- **bcryptjs** (optional): For password hashing (alternative to `pbkdf2Sync`).
- **dotenv**: For securely loading environment variables.
- **crypto**: Built-in Node.js library for cryptographic operations.
- **CORS**: For handling cross-origin requests.

---

## Functionality

### User Registration (`https://rurblist-server.onrender.com/register`)

**Input**:

- User details (email, password, username, etc.)

**Process**:

1. Hash the password using `pbkdf2Sync` (or `bcrypt`).
2. Create a new user and save it to the database.
3. Send a welcome email via Nodemailer.

**Response**:

- Success message or error message.

---

### User Login (`/login`)

**Input**:

- Username and password.

**Process**:

1. Find the user by username.
2. Compare the input password with the stored hashed password.
3. If valid, generate a JWT token with user ID and email.

**Response**:

- JWT token or error message.

---

### Forgot Password (`https://rurblist-server.onrender.com/forgot-password`)

**Input**:

- User email address.

**Process**:

1. Check if the email exists in the database.
2. Generate a password reset token and save it.
3. Send a reset email with a link containing the token.

**Response**:

- Success message or error message.

---

### Reset Password (`https://rurblist-server.onrender.com/reset-password/:token`)

**Input**:

- Reset token and new password.

**Process**:

1. Validate the reset token and ensure it's not expired.
2. Update the user's password with a new hashed value.
3. Clear the reset token from the database.

**Response**:

- Success message or error message.

---

### Admin User Management (Protected Routes)

**Routes**:

- `https://rurblist-server.onrender.com/all-users`: View all users.
- `https://rurblist-server.onrender.com/user/:userId`: View, update, or delete a specific user.

**Permissions**:

- Admin users can manage other users.

**Process**:

- Admin privileges are verified using middleware.

## Current Features

- **User Registration**: Users can successfully register, and a welcome email is sent.
- **User Login**: Users can log in and receive a JWT token for authentication.
- **Password Reset Request**: Users can request a password reset, and a reset link is sent to their email.
- **Password Reset**: Users can reset their password using a valid reset token.
- **Admin User Management**: Admins can view, update, and delete users.

---

## Issues and Areas for Improvement

### Security Considerations

- **Password Hashing**: The current implementation uses `pbkdf2Sync`. Switching to `bcrypt` is recommended for better security and automatic salting.
- **Token Expiration**: Ensure the reset token is invalidated once used for password reset to avoid misuse.
- **JWT Secret**: Securely store the `JWT_SECRET` in environment variables to prevent exposure.

### Missing Features

- **Email Template**: The current email structure is static. Consider using external templates for better management.
- **Redirection on Success**: After a successful password reset, users should be redirected to the login page with a success message.

### Error Handling

- More descriptive error messages should be provided for edge cases like incorrect passwords, expired tokens, etc.

### CORS

- Currently set to only allow requests from `*`. Ensure this configuration is updated when deploying to production.

---

## What Needs to be Changed

### 1. Switch to bcrypt for Password Hashing

- Update `genPassword` and `validatePass` functions to use `bcrypt` for more secure password handling.

### 2. Improve Token Handling

- Ensure that password reset tokens are invalidated immediately after use.

### 3. Password Reset Flow

- After resetting the password, redirect the user to the login page.

### 4. Environment Configuration

- Securely load sensitive environment variables from `.env` and ensure they are not hardcoded.

### 5. Enhanced Error Handling

- Provide more detailed error messages, especially for authentication failures or invalid tokens.

### 6. Admin Routes Security

- Ensure admin routes are protected with robust authorization middleware.

---

## Future Enhancements

- **Email Verification**: Add email verification to ensure users provide a valid email during registration.
- **Multi-Factor Authentication (MFA)**: Enhance security with multi-factor authentication for sensitive actions.
- **Rate Limiting**: Implement rate limiting to prevent brute-force attacks on login and password reset routes.

# Properties API Documentation for Frontend Developers

This document provides detailed information about the `Properties` API to help frontend developers integrate the backend services effectively. The API endpoints are designed to manage property listings, including creation, fetching, updating, deleting, commenting, and liking.

---

## Base URL

**`https://rurblist-server.onrender.com/api/v1/properties`**

---

## Endpoints

### 1. **Create a New Property**

- **URL**: `/create`
- **Method**: `POST`
- **Description**: Creates a new property listing.
- **Required Parameters** (in `req.body`):
  - `title` (string): Title of the property.
  - `description` (string): Detailed description of the property.
  - `price` (number): Price of the property (must be positive).
  - `location` (string): Address or general location of the property.
  - `type` (string): Type of the property. Accepted values:
    - `bedsitter`
    - `self_contain`
    - `flat`
    - `boys_quarters`
    - `duplexes`
    - `mansion`
  - `images` (optional, array of image IDs): IDs of uploaded property images.
- **Response**:
  - **201**: Property created successfully.
  - **400**: Missing required fields.
  - **500**: Server error.

---

### 2. **Fetch All Properties**

- **URL**: `/`
- **Method**: `GET`
- **Description**: Retrieves all properties in the database, including associated images and comments.
- **Response**:
  - **200**: Returns an array of property objects.
  - **500**: Failed to fetch properties.

---

### 3. **Fetch a Single Property by ID**

- **URL**: `/:id`
- **Method**: `GET`
- **Description**: Retrieves details of a specific property by its ID.
- **Required Parameters**:
  - `id` (string): The ID of the property.
- **Response**:
  - **200**: Returns the property details.
  - **404**: Property not found.
  - **500**: Server error.

---

### 4. **Update a Property**

- **URL**: `/:id`
- **Method**: `PUT`
- **Description**: Updates the details of a specific property by its ID.
- **Required Parameters**:
  - `id` (string): The ID of the property.
  - Request body contains only the fields you wish to update (e.g., `title`, `price`, etc.).
- **Response**:
  - **200**: Property updated successfully.
  - **400**: No fields provided for update.
  - **404**: Property not found.
  - **500**: Failed to update property.

---

### 5. **Delete a Property**

- **URL**: `/:id`
- **Method**: `DELETE`
- **Description**: Deletes a specific property by its ID.
- **Required Parameters**:
  - `id` (string): The ID of the property.
- **Response**:
  - **200**: Property deleted successfully.
  - **404**: Property not found.
  - **500**: Failed to delete property.

---

### 6. **Add a Comment to a Property**

- **URL**: `/:id/comment`
- **Method**: `POST`
- **Description**: Adds a comment to a specific property.
- **Required Parameters**:
  - `id` (string): The ID of the property.
  - `comment` (string, in `req.body`): The comment text.
- **Response**:
  - **201**: Comment added successfully.
  - **400**: Comment text is required.
  - **404**: Property not found.
  - **500**: Failed to add comment.

---

### 7. **Like a Property**

- **URL**: `/:id/like`
- **Method**: `POST`
- **Description**: Increments the like count for a specific property.
- **Required Parameters**:
  - `id` (string): The ID of the property.
- **Response**:
  - **200**: Property liked successfully.
  - **404**: Property not found.
  - **500**: Failed to like property.

---

## Property Schema

Here are the possible fields for a property object:

- **`title`**: Title of the property.
- **`description`**: Detailed description of the property.
- **`price`**: Price of the property (positive number).
- **`location`**: Address or general location of the property.
- **`status`**: Status of the property. Possible values:
  - `for_rent`
  - `for_sale`
  - `sold`
- **`type`**: Type of the property. Possible values:
  - `bedsitter`
  - `self_contain`
  - `flat`
  - `boys_quarters`
  - `duplexes`
  - `mansion`
- **`images`**: Array of image IDs.
- **`comments`**: Array of comment IDs.
- **`like`**: Number of likes for the property.
- **`user`**: ID of the user who created the property.
- **`latitude`**: Latitude coordinate (optional).
- **`longitude`**: Longitude coordinate (optional).
- **`createdAt`**: Timestamp when the property was created.
- **`updatedAt`**: Timestamp when the property was last updated.

---

## Notes for Frontend Developers

1. **Authentication**:

   - Most endpoints require authentication.
   - Pass the user token in the `Authorization` header for protected routes.

2. **Image Handling**:

   - Use the `images` array to send or display property images.
   - Images are stored as IDs referencing the `PropertyImage` model.

3. **Pagination and Filtering**:

   - If required, implement pagination and filtering on the frontend using query parameters (e.g., `/api/properties?page=1&type=flat`).

4. **Error Handling**:

   - Handle error codes (`400`, `404`, `500`) gracefully on the frontend.
   - Display user-friendly messages based on the error type.

5. **Map Integration**:
   - Use `latitude` and `longitude` to integrate map-based features (e.g., property location on Google Maps).

---

# Tour Booking API Documentation

## Base URL

```
https://rurblist-server.onrender.com/api/v1/tour/
```

## Authentication

Currently, no authentication is required for the endpoints.

## Endpoints

### 1. Create Tour

Creates a new tour booking in the system.

**Endpoint:** `POST /tour`

**Full URL:** `https://rurblist-server.onrender.com/api/v1/tour`

**Request Body:**

```json
{
  "datetime": "2024-02-20T10:00:00Z", // ISO 8601 date format
  "email": "john@example.com",
  "phone": "+1234567890",
  "fullname": "John Doe"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456gh789",
    "datetime": "2024-02-20T10:00:00Z",
    "email": "john@example.com",
    "phone": "+1234567890",
    "fullname": "John Doe"
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "error": "Error message details"
}
```

### 2. Get All Tours

Retrieves a list of all tour bookings.

**Endpoint:** `GET /tour`

**Full URL:** `https://rurblist-server.onrender.com/api/v1/tour`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "65abc123def456gh789",
      "datetime": "2024-02-20T10:00:00Z",
      "email": "john@example.com",
      "phone": "+1234567890",
      "fullname": "John Doe"
    }
    // ... more tours
  ]
}
```

**Error Response (500 Internal Server Error):**

```json
{
  "success": false,
  "error": "Error message details"
}
```

### 3. Get Tour by ID

Retrieves a specific tour booking by its ID.

**Endpoint:** `GET /tour/:id`

**Full URL:** `https://rurblist-server.onrender.com/api/v1/tour/:id`

**Parameters:**

- `id` (path parameter): The unique identifier of the tour

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456gh789",
    "datetime": "2024-02-20T10:00:00Z",
    "email": "john@example.com",
    "phone": "+1234567890",
    "fullname": "John Doe"
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "message": "Tour not found"
}
```

### 4. Update Tour

Updates an existing tour booking by its ID.

**Endpoint:** `PUT /tour/:id`

**Full URL:** `https://rurblist-server.onrender.com/api/v1/tour/:id`

**Parameters:**

- `id` (path parameter): The unique identifier of the tour

**Request Body:**

```json
{
  "datetime": "2024-02-21T11:00:00Z", // Optional
  "email": "john.updated@example.com", // Optional
  "phone": "+1987654321", // Optional
  "fullname": "John Smith" // Optional
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "65abc123def456gh789",
    "datetime": "2024-02-21T11:00:00Z",
    "email": "john.updated@example.com",
    "phone": "+1987654321",
    "fullname": "John Smith"
  }
}
```

**Error Responses:**

- 404 Not Found:

```json
{
  "success": false,
  "message": "Tour not found"
}
```

- 400 Bad Request:

```json
{
  "success": false,
  "error": "Error message details"
}
```

### 5. Delete Tour

Deletes a specific tour booking by its ID.

**Endpoint:** `DELETE /tour/:id`

**Full URL:** `https://rurblist-server.onrender.com/api/v1/tour/:id`

**Parameters:**

- `id` (path parameter): The unique identifier of the tour

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Tour deleted successfully"
}
```

**Error Response (404 Not Found):**

```json
{
  "success": false,
  "message": "Tour not found"
}
```

## Data Models

### Tour Schema

```javascript
{
  datetime: Date,    // Required
  email: String,     // Required
  phone: String,     // Required
  fullname: String   // Required
}
```

## Example Usage (JavaScript/Fetch)

```javascript
const BASE_URL = "https://rurblist-server.onrender.com/api/v1/tour";

// Create a new tour
const createTour = async (tourData) => {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tourData),
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating tour:", error);
  }
};

// Get all tours
const getAllTours = async () => {
  try {
    const response = await fetch(BASE_URL);
    return await response.json();
  } catch (error) {
    console.error("Error fetching tours:", error);
  }
};
```

## Error Handling

- All endpoints return a `success` boolean indicating the status of the request
- Failed requests include either an `error` or `message` field with details
- Common HTTP status codes:
  - 200: Successful request
  - 201: Resource created successfully
  - 400: Bad request / Invalid data
  - 404: Resource not found
  - 500: Server error

## Notes

1. All dates should be sent in ISO 8601 format
2. Phone numbers should include country code
3. All fields are required when creating a new tour
4. Fields are optional when updating an existing tour
5. The API follows RESTful conventions with the base path `/api/v1/tour`
