# coding-project-template

# Hands-on Lab: Implementing User Registration and Login

![Skills Network logo](https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBM-CC0100EN-SkillsNetwork/images/IDSN-logo.png)

## Estimated Time

Approximately **30 minutes**.

## Lab Overview

In this lab, you will create user registration and login API endpoints for a customer portal using:

- Node.js.
- Express.js.
- MongoDB.
- Mongoose.
- bcrypt.
- Express sessions.
- Cookies.

The customer portal allows customers to create accounts, log in, and maintain a session while using the application.

## Learning Objectives

After completing this lab, you will be able to:

- Create a customer collection in MongoDB.
- Create a POST API endpoint for customer registration.
- Hash passwords securely with bcrypt.
- Create a POST API endpoint for customer login.
- Create a session for authenticated users.
- Use cookies to store non-sensitive client information.
- Implement logout functionality.

## About Skills Network Cloud IDE

Skills Network Cloud IDE is based on Theia and Docker. It provides an integrated development environment for completing hands-on course and project labs.

## Important Lab Environment Notice

This lab environment is temporary. Sessions do not persist, and a new environment is created each time you reconnect. Any files or data created during an earlier session may be lost.

Complete the lab in one session and save important work locally before leaving.

## Start the MongoDB Server

1. Open the Skills Network Toolbox.
2. Locate MongoDB.
3. If MongoDB is inactive, select it.
4. Click **Create** or **Start**.
5. Wait for MongoDB to become active.
6. Open **Connection Information**.
7. Record the MongoDB host, port, username, and password.

MongoDB authentication is enabled in this environment. The username is usually `root`.

> **Security note:** Do not place the MongoDB password or session secret directly in JavaScript files. Use environment variables as shown below.

## Clone the Starter Repository

Open a new terminal and clone the starter project:

"
git clone https://github.com/ibm-developer-skills-network/abltc-backend-nodejs-customerportal.git
"

Change into the project directory:

"
cd abltc-backend-nodejs-customerportal
"

Install the project dependencies:

"
npm install
"

The project includes packages for Express, Mongoose, request-body parsing, and the customer portal application.

## Inspect the Customer Model

Open `customer.js` in the editor.

The customer model defines the structure of customer documents. The fields include:

- `user_name`: Required string value.
- `password`: Required string value.
- `email`: Required string value.
- `age`: Required integer value.

The password field must store a password hash rather than the original password.

## Configure Environment Variables

Create a `.env` file in the project directory:

"
MONGODB_USER=root
MONGODB_PASSWORD=replace_with_your_mongodb_password
MONGODB_HOST=replace_with_your_mongodb_host
MONGODB_PORT=27017
MONGODB_DATABASE=customerPortal
SESSION_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
"

Add `.env` to `.gitignore`:

"
node_modules/
.env
"

Never commit the `.env` file to GitHub or another public repository.

## Inspect and Configure the Application

Open `customer_app.js` and review the existing code.

The application uses the `frontend` directory to serve static files. The default `/` route renders `home.html`, which is the starting page for the customer portal.

Replace the hard-coded MongoDB connection string with a connection built from environment variables:

"
require("dotenv").config();

const mongoose = require("mongoose");

const {
  MONGODB_USER,
  MONGODB_PASSWORD,
  MONGODB_HOST,
  MONGODB_PORT,
  MONGODB_DATABASE
} = process.env;

const mongoUri =
  `mongodb://${encodeURIComponent(MONGODB_USER)}:` +
  `${encodeURIComponent(MONGODB_PASSWORD)}@` +
  `${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?authSource=admin`;

mongoose.connect(mongoUri);
"

Install dotenv if the starter project does not already include it:

"
npm install dotenv
"

## Run the Initial Application

Start the application:

"
node customer_app.js
"

To open the customer portal:

1. Click the Skills Network icon in the left toolbar.
2. Select **Launch Application**.
3. Enter port `3000`.
4. Open the application in a new tab.

Stop the server with:

"
Ctrl+C
"

## Add Password Hashing with bcrypt

The initial application stores the password directly in the database. This is unsafe. Passwords must be hashed before they are stored.

> **Important:** bcrypt performs password hashing, not reversible encryption. The original password cannot be recovered from the hash.

Install bcrypt:

"
npm install bcrypt
"

Import bcrypt in `customer_app.js`:

"
const bcrypt = require("bcrypt");
"

Define a work factor. The exact value should be tested against the application's performance requirements:

"
const saltRounds = 12;
"

## Implement Customer Registration

Replace the customer-registration endpoint with the following secure version:

"
app.post("/api/add_customer", async (req, res) => {
  try {
    const data = req.body;

    const existingCustomer = await Customers.findOne({
      user_name: data.user_name
    });

    if (existingCustomer) {
      return res.status(409).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      saltRounds
    );

    const customer = new Customers({
      user_name: data.user_name,
      age: data.age,
      password: hashedPassword,
      email: data.email
    });

    await customer.save();

    res.status(201).send("Customer added successfully");
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).send("Unable to register customer");
  }
});
"

This endpoint:

1. Reads the submitted customer data.
2. Checks whether the username already exists.
3. Hashes the password with bcrypt.
4. Creates a customer document.
5. Saves the customer to MongoDB.
6. Returns a success response.

The original password is never stored in the database.

## Implement Customer Login

Login should use a POST request because credentials are submitted in the request body.

Replace the customer-login endpoint with:

"
app.post("/api/login", async (req, res) => {
  try {
    const { user_name, password } = req.body;

    const customer = await Customers.findOne({ user_name });

    if (!customer) {
      return res.status(401).send("User information incorrect");
    }

    const passwordMatches = await bcrypt.compare(
      password,
      customer.password
    );

    if (!passwordMatches) {
      return res.status(401).send("Password incorrect");
    }

    res.send("User logged in");
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).send("Unable to log in");
  }
});
"

The important part is checking the result returned by `bcrypt.compare`. Do not use `if (true)`, because that would allow every password to pass.

## Add Express Sessions

Install the session package:

"
npm install express-session uuid
"

Import the required packages:

"
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
"

Add the session middleware after creating the Express application:

"
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    genid: () => uuidv4(),
    cookie: {
      maxAge: 120000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  })
);
"

The session cookie expires after two minutes in this lab example. In production, use a persistent session store instead of the default in-memory store.

## Store the User in the Session

Update the successful-login section so that the authenticated user's information is stored in the session:

"
if (!passwordMatches) {
  return res.status(401).send("Password incorrect");
}

req.session.userId = customer._id.toString();
req.session.userName = customer.user_name;

res.cookie("username", customer.user_name, {
  httpOnly: false,
  sameSite: "lax",
  maxAge: 120000
});

res.send("User logged in");
"

Do not store passwords or password hashes in cookies or session data.

## Add Logout Functionality

Add a logout endpoint:

"
app.get("/api/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie("connect.sid");
    res.clearCookie("username");
    res.redirect("/");
  });
});
"

The logout endpoint destroys the server-side session and clears the related cookies.

## Run and Test the Application

Start the server:

"
node customer_app.js
"

Launch the customer portal:

1. Click the Skills Network icon in the left toolbar.
2. Select **Launch Application**.
3. Enter port `3000`.
4. Open the application in a new tab.
5. Register a new customer.
6. Confirm that the password stored in MongoDB is a bcrypt hash.
7. Log in with the correct password.
8. Try an incorrect password and verify that login fails.
9. Log out and verify that the session is destroyed.

Stop the server with:

"
Ctrl+C
"

## Troubleshooting

If the application does not work, check the following:

- MongoDB is active in the Skills Network Toolbox.
- The MongoDB host and password in `.env` are correct.
- The MongoDB database name is correct.
- The `dotenv` package is installed.
- The `bcrypt` package is installed.
- The `express-session` package is installed.
- The `uuid` package is installed.
- The session secret exists in `.env`.
- The customer model is imported correctly.
- The password comparison uses the result of `bcrypt.compare`.
- The application is running on port `3000`.
- The browser is using the correct launched application URL.

## Security Notes

- Passwords should be hashed with bcrypt or Argon2.
- Passwords must never be stored as plain text.
- Database credentials must be stored in environment variables.
- Session secrets must be stored in environment variables.
- Do not log passwords or password hashes.
- Use generic authentication error messages.
- Use HTTPS in production.
- Use secure, HttpOnly, and SameSite cookies where appropriate.
- Regenerate session IDs after login to reduce session-fixation risks.
- Use a persistent session store in production instead of the default in-memory store.
- Validate and sanitize registration and login input.
- Apply rate limiting to login endpoints.

## Summary

In this lab, you:

1. Started the MongoDB server.
2. Cloned the customer portal starter repository.
3. Installed the required Node.js packages.
4. Configured a secure MongoDB connection.
5. Reviewed the customer schema.
6. Created a customer registration endpoint.
7. Added bcrypt password hashing.
8. Created a customer login endpoint.
9. Compared passwords securely with bcrypt.
10. Added Express session middleware.
11. Stored authenticated user information in a session.
12. Created a logout endpoint.
13. Cleared sessions and cookies during logout.

Congratulations! You successfully implemented user registration, login, logout, sessions, cookies, and secure password hashing.

## Authors

- Lavanya T. S.

### Other Contributors

- Rama

© IBM Corporation. All rights reserved.
