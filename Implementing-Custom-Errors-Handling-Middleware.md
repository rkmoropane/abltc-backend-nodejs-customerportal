# Lab: Implementing Custom Error-Handling Middleware in an Express App

## Overview

This lab demonstrates how to create custom error classes and handle them with global Express.js error-handling middleware.

Proper error handling makes applications:

- Easier to maintain.
- Easier to debug.
- More reliable.
- More user-friendly.
- Less likely to crash unexpectedly.

---

## Estimated Effort

Approximately 30 minutes.

---

## Learning Objectives

By completing this lab, you will learn how to:

1. Create custom error classes.
2. Throw custom errors from application routes.
3. Pass errors to global error-handling middleware.
4. Handle invalid requests.
5. Handle validation errors.
6. Handle invalid users.
7. Handle authentication failures.
8. Return formatted JSON error responses.

---

## Prerequisites

You should have completed the previous error-handling lab:

[Implementing Error Handling in Node](https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBMSkillsNetwork-JS0211EN-SkillsNetwork/labs/v1/m4/Implementing_Error_Handling_in_Node.md.html)

You should also have:

- Node.js installed.
- npm installed.
- Basic knowledge of Express.js.
- Basic knowledge of MongoDB.
- A terminal and code editor.

---

# Step 1: Start the MongoDB Server

Open the Skills Network Toolbox.

MongoDB may appear as inactive, which means that the database is not currently available.

Select MongoDB and choose the option to create or start the database server.

MongoDB will start as a background process.

After the server starts, open the Connection Information section and record the MongoDB password.

You will need the password to connect as the root user.

> Keep the MongoDB password secure. Do not commit it to a repository or expose it in public code.

---

# Step 2: Clone the Customer Portal Application

Open a new terminal.

Clone the Customer Portal repository.

"
git clone https://github.com/ibm-developer-skills-network/abltc-backend-nodejs-customerportal.git
"

Change to the newly created directory.

"
cd abltc-backend-nodejs-customerportal
"

Install the required packages.

"
npm install
"

The dependencies are already listed in package.json.

---

# Step 3: Configure the MongoDB Password

Open customer_app.js in the editor.

Replace the placeholder MongoDB password with the password provided by the MongoDB instance.

Do not commit the real password to source control.

---

# Step 4: Add the Global Error Handler

Add the following middleware before starting the Express application.

"
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  console.log(err.stack);

  res.status(err.statusCode).json({
    status: err.statusCode,
    message: err.message
  });
});
"

This middleware:

- Receives errors from application routes.
- Assigns a default status code of 500.
- Assigns a default status value.
- Logs the error stack.
- Sends a JSON response to the client.

---

# Step 5: Handle Invalid Requests

Add the following middleware after the application routes and before the global error handler, or according to the middleware order used by the application.

"
app.all("*", (req, res, next) => {
  const err = new Error(
    `Cannot find the URL ${req.originalUrl} in this application. Please check.`
  );

  err.status = "Endpoint Failure";
  err.statusCode = 404;

  next(err);
});
"

This middleware catches requests that do not match an existing endpoint.

It:

- Creates a custom error.
- Sets the status code to 404.
- Adds a descriptive error message.
- Passes the error to the global error handler.

---

# Step 6: Run the Customer Portal

Start the application.

"
node customer_app.js
"

The Express.js application should start on port 3000.

Open the Customer Portal application.

Test a non-existent endpoint by appending the following path to the application URL:

"
checkIfExists
"

For example:

"
http://localhost:3000/checkIfExists
"

The application should:

- Continue running.
- Return a JSON error response.
- Display the error stack in the terminal.
- Allow other endpoints to continue working.

Stop the server with:

"
Ctrl+C
"

---

# Step 7: Create the Errors Directory

Create a directory named errors.

"
mkdir errors
"

Change into the errors directory.

"
cd errors
"

Create a file named CustomError.js.

"
touch CustomError.js
"

---

# Step 8: Create Custom Error Classes

Open CustomError.js and add the following code.

"
class ValidationError extends Error {
  constructor(message) {
    super(message);

    this.code = 407;
    this.name = "ValidationError";
  }
}

class InvalidUserError extends Error {
  constructor(message) {
    super(message);

    this.code = 407;
    this.name = "InvalidUserError";
  }
}

class AuthenticationFailed extends Error {
  constructor(message) {
    super(message);

    this.code = 407;
    this.name = "AuthenticationFailed";
  }
}

module.exports = {
  ValidationError,
  InvalidUserError,
  AuthenticationFailed
};
"

The custom error classes extend the built-in Error class.

### ValidationError

ValidationError is used when submitted data does not meet the application's requirements.

Example:

- A customer is younger than 21.
- A username already exists.
- Required registration data is invalid.

### InvalidUserError

InvalidUserError is used when a login attempt is made with a username that does not exist in the database.

### AuthenticationFailed

AuthenticationFailed is used when a username exists but the password is incorrect.

---

# Step 9: Return to the Application Directory

Move back to the Customer Portal application directory.

"
cd ..
"

Open customer_app.js.

Import the custom error classes.

"
const {
  ValidationError,
  InvalidUserError,
  AuthenticationFailed
} = require("./errors/CustomError");
"

---

# Step 10: Add Custom Registration Errors

Replace the existing /api/add_customer route with the following code.

"
app.post("/api/add_customer", async (req, res, next) => {
  const data = req.body;
  const age = parseInt(data.age, 10);

  try {
    if (age < 21) {
      throw new ValidationError(
        "Customer is under the required age limit"
      );
    }

    const customer = new Customers({
      user_name: data.user_name,
      age: age,
      password: data.password,
      email: data.email
    });

    await customer.save();

    res.send("Customer added successfully");
  } catch (error) {
    next(error);
  }
});
"

This route:

- Reads the registration data.
- Converts the age to an integer.
- Checks whether the customer is at least 21.
- Throws a ValidationError when the age is invalid.
- Creates and saves a customer.
- Passes errors to the global error handler.

---

# Step 11: Add Custom Login Errors

Replace the existing /api/login route with the following code.

"
app.post("/api/login", async (req, res, next) => {
  const data = req.body;
  const userName = data.user_name;
  const password = data.password;

  try {
    const user = await Customers.findOne({
      user_name: userName
    });

    if (!user) {
      throw new InvalidUserError(
        "No such user in database"
      );
    }

    if (user.password !== password) {
      throw new AuthenticationFailed(
        "Passwords do not match"
      );
    }

    res.send("User Logged In");
  } catch (error) {
    next(error);
  }
});
"

This route:

- Searches for a user by username.
- Throws InvalidUserError when the username does not exist.
- Throws AuthenticationFailed when the password is incorrect.
- Passes errors to the global error handler.
- Logs the user in when the credentials are correct.

> In a production application, passwords should be hashed and compared using a secure password-hashing library such as bcrypt.

---

# Step 12: Add the Logout Endpoint

Add the logout endpoint to customer_app.js.

"
app.get("/api/logout", async (req, res) => {
  res.cookie("username", "", {
    expires: new Date(0)
  });

  res.redirect("/");
});
"

This endpoint:

- Removes the username cookie.
- Redirects the user to the home page.

---

# Step 13: Start the Application

Start the Customer Portal application.

"
node customer_app.js
"

The Express.js server should run on port 3000.

Open the Customer Portal application in a browser.

---

# Step 14: Test Registration Validation

Attempt to register a customer with an age below 21.

The application should return an error response similar to:

"
{
  "status": 500,
  "message": "Customer is under the required age limit"
}
"

The error stack should also appear in the terminal.

> The example global handler defaults unassigned errors to status code 500. In a production application, validation errors should normally use a client-error status such as 400.

Now register a customer with an age greater than or equal to 21.

The customer should be saved successfully in the database.

---

# Step 15: Test Invalid User Login

Attempt to log in with a username that does not exist.

The application should return a response similar to:

"
{
  "status": 500,
  "message": "No such user in database"
}
"

The error stack should also appear in the terminal.

---

# Step 16: Test Authentication Failure

Attempt to log in with a valid username and an incorrect password.

The application should return a response similar to:

"
{
  "status": 500,
  "message": "Passwords do not match"
}
"

The error stack should also appear in the terminal.

---

# Error-Handling Flow

The application follows this error-handling process:

1. A request is received.
2. The route validates or processes the request.
3. A custom error is created when a problem occurs.
4. The route passes the error to next.
5. The global error handler receives the error.
6. The error is logged.
7. A JSON response is returned to the client.
8. The server continues running.

Example:

"
try {
  throw new ValidationError("Invalid customer data");
} catch (error) {
  next(error);
}
"

---

# Important Concepts

## Custom Error Classes

Custom error classes extend the built-in Error class and provide meaningful names and properties.

## Global Error Handler

A global error handler manages errors from multiple routes in one central location.

## Error Propagation

The next function passes errors from routes to the error-handling middleware.

## Endpoint Error Handling

The app.all("*") middleware handles requests that do not match any available endpoint.

## Error Status Codes

HTTP status codes communicate the result of a request.

Common examples include:

| Status Code | Meaning |
|---|---|
| 200 | Request succeeded |
| 400 | Invalid request |
| 401 | Authentication required or failed |
| 404 | Resource or endpoint not found |
| 500 | Internal server error |

---

# Practice Exercise

Complete the following tasks:

1. Add a Name field to the Customer collection.
2. Validate that Name contains a string value only.
3. Create a custom error for invalid Name values.
4. Pass the custom error to the global error handler.
5. Implement custom error handling for user registration with bcrypt.
6. Implement custom error handling for authentication with JWT.
7. Return suitable status codes and messages for each error.

---

# Best Practices

- Keep custom error classes in a separate file.
- Use meaningful error names.
- Add useful properties such as statusCode and code.
- Pass route errors to next.
- Keep global error handling in one location.
- Log stack traces for debugging.
- Do not expose sensitive information in error responses.
- Use status code 400 for invalid client input.
- Use status code 401 for authentication failures.
- Use status code 404 for missing resources or endpoints.
- Use status code 500 for unexpected server errors.
- Hash passwords before saving them.
- Use JWT securely for authentication.
- Never store plain-text passwords.
- Store database credentials securely.
- Avoid committing credentials to Git repositories.

---

# Lab Summary

In this lab, you added custom error handling to an Express.js Customer Portal application.

You learned how to:

- Start a MongoDB server.
- Clone and configure an existing Node.js application.
- Add global error-handling middleware.
- Handle invalid routes.
- Create custom error classes.
- Throw ValidationError errors.
- Throw InvalidUserError errors.
- Throw AuthenticationFailed errors.
- Pass errors to the global handler with next.
- Return JSON error responses.
- Log error stacks for debugging.
- Handle registration and login failures.

Custom error classes make application errors easier to identify and manage. Global error-handling middleware prevents repeated error-handling logic and allows the application to return consistent responses.

---

## Author

[**Lavanya T. S.**](https://www.linkedin.com/in/lavanya-sunderarajan-199a445/)
