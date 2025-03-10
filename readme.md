# Rurblist

Rurblist is an online real estate marketplace designed to streamline property search and empower realtors to showcase their professionalism, building a reputation that clients can trust.

Features include apartment listing, detailed home search, and user authentication.

The platform is built to make access to dream homes just a click away, making it suitable for all home searchers and realtors.

Rurblist aims to bridge the gap between realtors and clients, fostering a community that values connection, trust, and growth.

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
9. [API Documentation](#api-documentation)
   1. [User Authentication and Management](#user-authentication-and-management)
   2. [Properties API](#properties-api)
   3. [Tour Booking API](#tour-booking-api)
   4. [Comments API](#comments-api)

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

---

## API Documentation

### User Authentication and Management

#### Register User

- **URL**: `/register`
- **Method**: `POST`
- **Description**: Registers a new user.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```
- **Response**:
  - **201**: User successfully created.
  - **400**: Missing required fields.
  - **500**: Server error.

#### Login User

- **URL**: `/login`
- **Method**: `POST`
- **Description**: Logs in a user.
- **Request Body**:
  ```json
  {
    "username": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  - **200**: User successfully logged in.
  - **401**: Invalid credentials.
  - **500**: Server error.

#### Forgot Password

- **URL**: `/forgot-password`
- **Method**: `POST`
- **Description**: Sends a password reset email.
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  - **200**: Password reset email sent.
  - **404**: Email not found.
  - **500**: Server error.

#### Reset Password

- **URL**: `/reset-password/:token`
- **Method**: `POST`
- **Description**: Resets the user's password.
- **Request Body**:
  ```json
  {
    "newPassword": "newpassword123"
  }
  ```
- **Response**:
  - **200**: Password successfully reset.
  - **400**: Invalid or expired token.
  - **500**: Server error.

#### Get User ID

- **URL**: `/api/v1/users/user-id`
- **Method**: `GET`
- **Description**: Retrieves the authenticated user's ID.
- **Authentication**: Required
- **Headers**:
  ```json
  {
    "Authorization": "Bearer YOUR_JWT_TOKEN"
  }
  ```
- **Response**:
  ```json
  {
    "userId": "user_id_here"
  }
  ```
- **Error Response**:
  ```json
  {
    "error": "Unauthorized"
  }
  ```

Example usage:

```javascript
fetch("https://rurblist-server.onrender.com/api/v1/users/user-id", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

### Properties API

#### Create a New Property

- **URL**: `/api/v1/properties/create`
- **Method**: `POST`
- **Description**: Creates a new property listing.
- **Request Body**:
  ```json
  {
    "title": "Beautiful Apartment",
    "description": "A beautiful apartment in the city center.",
    "price": 100000,
    "location": "City Center",
    "type": "flat",
    "latitude": 40.7128,
    "longitude": -74.006
  }
  ```
- **Response**:
  - **201**: Property created successfully.
  - **400**: Missing required fields.
  - **500**: Server error.

#### Fetch All Properties

- **URL**: `/api/v1/properties`
- **Method**: `GET`
- **Description**: Retrieves all properties in the database.
- **Response**:
  - **200**: Returns an array of property objects.
  - **500**: Failed to fetch properties.

#### Fetch a Single Property by ID

- **URL**: `/api/v1/properties/:id`
- **Method**: `GET`
- **Description**: Retrieves details of a specific property by its ID.
- **Response**:
  - **200**: Returns the property details.
  - **404**: Property not found.
  - **500**: Server error.

#### Update a Property

- **URL**: `/api/v1/properties/:id`
- **Method**: `PUT`
- **Description**: Updates the details of a specific property by its ID.
- **Request Body**:
  ```json
  {
    "title": "Updated Title",
    "price": 120000
  }
  ```
- **Response**:
  - **200**: Property updated successfully.
  - **400**: No fields provided for update.
  - **404**: Property not found.
  - **500**: Failed to update property.

#### Delete a Property

- **URL**: `/api/v1/properties/:id`
- **Method**: `DELETE`
- **Description**: Deletes a specific property by its ID.
- **Response**:
  - **200**: Property deleted successfully.
  - **404**: Property not found.
  - **500**: Failed to delete property.

#### Add a Comment to a Property

- **URL**: `/api/v1/properties/:id/comment`
- **Method**: `POST`
- **Description**: Adds a comment to a specific property.
- **Request Body**:
  ```json
  {
    "comment": "This is a great property!"
  }
  ```
- **Response**:
  - **201**: Comment added successfully.
  - **400**: Comment text is required.
  - **404**: Property not found.
  - **500**: Failed to add comment.

#### Like a Property

- **URL**: `/api/v1/properties/:id/like`
- **Method**: `POST`
- **Description**: Toggles like status for a property. If the user has already liked the property, sending this request will unlike it. If the user hasn't liked the property, it will add their like.
- **Authentication**: Required (Bearer Token)
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Property liked." // or "Property unliked."
    "likeCount": 5 // Total number of likes after the operation
  }
  ```
- **Error Response**:
  - **401**: Authentication required
  - **404**: Property not found
  - **500**: Server error

Example usage:

```javascript
const likeProperty = async (propertyId) => {
  try {
    const response = await fetch(`/api/v1/properties/${propertyId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  } catch (error) {
    console.error("Error:", error);
  }
};
```

### Tour Booking API

#### Create Tour

- **URL**: `/api/v1/tour`
- **Method**: `POST`
- **Description**: Creates a new tour booking.
- **Request Body**:
  ```json
  {
    "datetime": "2024-02-20T10:00:00Z",
    "email": "john@example.com",
    "phone": "+1234567890",
    "fullname": "John Doe"
  }
  ```
- **Response**:
  - **201**: Tour created successfully.
  - **400**: Missing required fields.
  - **500**: Server error.

#### Get All Tours

- **URL**: `/api/v1/tour`
- **Method**: `GET`
- **Description**: Retrieves a list of all tour bookings.
- **Response**:
  - **200**: Returns an array of tour objects.
  - **500**: Failed to fetch tours.

#### Get Tour by ID

- **URL**: `/api/v1/tour/:id`
- **Method**: `GET`
- **Description**: Retrieves a specific tour booking by its ID.
- **Response**:
  - **200**: Returns the tour details.
  - **404**: Tour not found.
  - **500**: Server error.

#### Update Tour

- **URL**: `/api/v1/tour/:id`
- **Method**: `PUT`
- **Description**: Updates an existing tour booking by its ID.
- **Request Body**:
  ```json
  {
    "datetime": "2024-02-21T11:00:00Z",
    "email": "john.updated@example.com",
    "phone": "+1987654321",
    "fullname": "John Smith"
  }
  ```
- **Response**:
  - **200**: Tour updated successfully.
  - **404**: Tour not found.
  - **400**: Invalid data.
  - **500**: Failed to update tour.

#### Delete Tour

- **URL**: `/api/v1/tour/:id`
- **Method**: `DELETE`
- **Description**: Deletes a specific tour booking by its ID.
- **Response**:
  - **200**: Tour deleted successfully.
  - **404**: Tour not found.
  - **500**: Failed to delete tour.

### Comments API

#### Create a Comment

- **URL**: `/api/v1/comments/properties/:id`
- **Method**: `POST`
- **Description**: Creates a new comment for a property
- **Authentication**: Required (Bearer Token)
- **Request Body**:
  ```json
  {
    "comment": "This is a great property!"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Comment added successfully",
    "comment": {
      "_id": "comment_id",
      "comment": "This is a great property!",
      "user": {
        "name": "User Name",
        "email": "user@example.com"
      },
      "property": {
        "title": "Property Title"
      }
    }
  }
  ```

#### Get Comment

- **URL**: `/api/v1/comments/:id`
- **Method**: `GET`
- **Description**: Retrieves a specific comment
- **Authentication**: Required (Bearer Token)
- **Success Response**:
  ```json
  {
    "success": true,
    "comment": {
      "_id": "comment_id",
      "comment": "Comment text",
      "user": {
        "name": "User Name",
        "email": "user@example.com"
      },
      "property": {
        "title": "Property Title"
      }
    }
  }
  ```

#### Update Comment

- **URL**: `/api/v1/comments/:id`
- **Method**: `PUT`
- **Description**: Updates an existing comment
- **Authentication**: Required (Bearer Token)
- **Request Body**:
  ```json
  {
    "comment": "Updated comment text"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Comment updated successfully",
    "comment": {
      "_id": "comment_id",
      "comment": "Updated comment text",
      "user": {
        "name": "User Name",
        "email": "user@example.com"
      },
      "property": {
        "title": "Property Title"
      }
    }
  }
  ```

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

## Example Usage (JavaScript/Fetch)

### Create a New Property

```javascript
const formData = new FormData();
formData.append("title", "Beautiful Apartment");
formData.append("description", "A beautiful apartment in the city center.");
formData.append("price", 100000);
formData.append("location", "City Center");
formData.append("type", "flat");
formData.append("latitude", 40.7128);
formData.append("longitude", -74.006);

images.forEach((image) => {
  formData.append("images", image);
});

fetch("https://rurblist-server.onrender.com/api/v1/properties/create", {
  method: "POST",
  body: formData,
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
```

### Fetch All Properties

```javascript
fetch("https://rurblist-server.onrender.com/api/v1/properties", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

### Get Property by ID

```javascript
const propertyId = "property_id_here";

fetch(`https://rurblist-server.onrender.com/api/v1/properties/${propertyId}`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

### Update Property

```javascript
const propertyId = "property_id_here";
const updateData = {
  title: "Updated Title",
  price: 150000,
};

fetch(`https://rurblist-server.onrender.com/api/v1/properties/${propertyId}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(updateData),
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

### Delete Property

```javascript
const propertyId = "property_id_here";

fetch(`https://rurblist-server.onrender.com/api/v1/properties/${propertyId}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

### Add Comment to Property

```javascript
const propertyId = "property_id_here";
const commentData = {
  comment: "This is a great property!",
};

fetch(
  `https://rurblist-server.onrender.com/api/v1/properties/${propertyId}/comment`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commentData),
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

### Create Tour Booking

```javascript
const tourData = {
  datetime: "2024-02-20T10:00:00Z",
  email: "john@example.com",
  phone: "+1234567890",
  fullname: "John Doe",
};

fetch("https://rurblist-server.onrender.com/api/v1/tour", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(tourData),
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));
```

## Common Error Responses

### Authentication Error

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication token is missing or invalid"
}
```

### Validation Error

```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Title is required", "Price must be a positive number"]
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "Not found",
  "message": "The requested resource was not found"
}
```

### Server Error

```json
{
  "success": false,
  "error": "Server error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are as follows:

- 100 requests per minute for authenticated users
- 30 requests per minute for unauthenticated users

When rate limit is exceeded, you'll receive:

```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Please try again later"
}
```

## Testing the API

For testing the API endpoints, you can use tools like:

- Postman
- cURL
- Thunder Client (VS Code Extension)

Example cURL command:

```bash
curl -X POST https://rurblist-server.onrender.com/api/v1/properties/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Property","price":100000,"location":"Test Location","type":"flat"}'
```
