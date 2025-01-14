# User Authentication and Management System Documentation

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

## Project Structure

```plaintext
- controllers/
    - auth.js            # User authentication logic (register, login, password reset)
    - user.js            # User-related operations (CRUD for users)
- lib/
    - passwordUtils.js   # Utilities for password hashing and validation
- routes/
    - auth.js            # Authentication routes (login, register, password reset)
    - users.js           # Admin routes for user management
- schemas/
    - User.js            # MongoDB User model schema
- config/
    - database.js        # MongoDB database connection setup
- views/
    - (ejs templates for rendering views like password reset page)
- .env                  # Environment variables for sensitive data
- server.js             # Main entry point (Express setup)
```

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
