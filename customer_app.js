require("dotenv").config();

// Importing necessary libraries and modules
const mongoose = require('mongoose');            // MongoDB ODM library
const Customers = require('./customer');         // Imported MongoDB model for 'customers'
const express = require('express');              // Express.js web framework
const session = require('express-session');

const bodyParser = require('body-parser');       // Middleware for parsing JSON requests
const path = require('path');                    // Node.js path module for working with file and directory paths
//  Modules to encrypt the password and store it
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');  // Added JWT library
const uuid = require('uuid'); //to generate a unique session id

// require the Custom errors create on Registration and Login, errors/CustomErrors.js 
const { ValidationError, InvalidUserError, AuthenticationFailed, DuplicateUserError } = require('./errors/CustomError');


const {
    MONGODB_USER,
    MONGODB_PASSWORD,
    MONGODB_HOST,
    MONGODB_PORT,
    MONGODB_DATABASE,
    SESSION_SECRET
  } = process.env;
  

const secretKey = SESSION_SECRET;  // Replace with a secure secret key
const saltRounds = 5
// const password = "admin"

// Creating an instance of the Express application
const app = express();

// A dictionary object to store username and password
let usersdic = {};

// Setting the port number for the server
const port = 3001;

// MongoDB connection URI and database name
const uri =
    `mongodb://${encodeURIComponent(MONGODB_USER)}:` +
    `${encodeURIComponent(MONGODB_PASSWORD)}@` +
    `${MONGODB_HOST}:${MONGODB_PORT}`;
  
// MongoDB connection URI and database name
// const uri =  "mongodb://root:your_password@localhost:27017";
mongoose.connect(uri, {'dbName': `${MONGODB_DATABASE}`});

    
    
app.use(session({
    cookie: { maxAge: 120000 }, // Session expires after 2 minutes of inactivity
    secret: `${SESSION_SECRET}`,
    resave: false,
    saveUninitialized: true,
    genid: () => uuid.v4()
}));

// Middleware to parse JSON requests
app.use("*", bodyParser.json());

// Middleware to handle URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serving static files from the 'frontend' directory under the '/static' route
app.use('/static', express.static(path.join(".", 'frontend')));

// GET endpoint for the root URL, serving the home page
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'home.html'));
});

// POST endpoint for user login
// app.post('/api/login', async (req, res) => {
//     const data = req.body;
//     console.log(data);
//     let user_name = data['user_name'];
//     let password = data['password'];

//     // Querying the MongoDB 'customers' collection for matching user_name and password
//     const documents = await Customers.find({ user_name: user_name, password: password });

//     // If a matching user is found, set the session username and serve the home page
//     if (documents.length > 0) {
//         res.send("User Logged In");
//     } else {
//         res.send("User Information incorrect");
//     }
// });

// // POST endpoint for user login
// app.post('/api/login', async (req, res) => {
//     const data = req.body;
//     console.log(data);

//     let user_name = data['user_name'];
//     let password = data['password'];

//     // Querying the MongoDB 'customers' collection for matching user_name and password
//     // const documents = await Customers.find({ user_name: user_name });

//     // // If a matching user is found, set the session username and serve the home page
//     // if (documents.length > 0) {
//     //     let result = await bcrypt.compare(password, documents[0]['password'])
//     //     if(result) {
//     //         const genidValue = req.sessionID;
//     //         res.cookie('username', user_name);
//     //         res.sendFile(path.join(__dirname, 'frontend', 'home.html'));
//     //     } else {
//     //         res.send("Password Incorrect! Try again");
//     //     }
//     // } else {
//     //     res.send("User Information incorrect");
//     const user = usersdic[user_name];
//     if (!user || !(await bcrypt.compare(password, user.hashedpwd))) {
//         res.status(401).send('User Information incorrect');
//         return;
//     }
 
//     // No need to print details to the terminal, just send a success message
//     res.status(200).send('Login successfully');
    
// });

// Added the custom errors classes to the '/app/login' endpoint
// POST endpoint for user login
app.post('/api/login', async (req, res, next) => {
    const data = req.body;
    const user_name = data['user_name'];
    const password = data['password'];
    if (!user_name || !password) {
        throw new ValidationError(
          "Username and password are required"
        );
      }
    
 
    try {
        const user = await Customers.findOne({ user_name: user_name.trim() });
        if (!user) {
            throw new InvalidUserError("No such user in database");
        }
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
          );
        if (!passwordMatches) {
            throw new AuthenticationFailed("Passwords don't match");
        }
        const token = jwt.sign({
            userID: user._id,
            user_name: user.user_name
        },
        secretKey,
        {
            expiresIn: '1h'
        }
        )
        const genidValue = req.sessionID;
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000
        });
        res.sendFile(path.join(__dirname, 'frontend', 'home.html'));
    } catch (error) {
        next(error);
    }
});


// GET endpoint for user logout
app.get('/api/logout', async (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
          next(err);
        } else {
          res.cookie('username', '', { expires: new Date(0) });
          res.redirect('/');
        }
      });
});

// New code for User log out Get endpoint 
// GET endpoint for user logout
// app.get('/api/logout', async (req, res) => {
// 	res.cookie('username', '', { expires: new Date(0) });
// 	res.redirect('/');
// });


// // POST endpoint for adding a new customer
// app.post('/api/add_customer', async (req, res) => {
//     const data = req.body;
//     console.log(data)
//     const documents = await Customers.find({ user_name: data['user_name']});
//     if (documents.length > 0) {
//         res.send("User already exists");
//     }
    
//     // Creating a new instance of the Customers model with data from the request
//     const customer = new Customers({
//         "user_name": data['user_name'],
//         "age": data['age'],
//         "password": data['password'],
//         "email": data['email']
//     });

//     // Saving the new customer to the MongoDB 'customers' collection
//     await customer.save();

//     res.send("Customer added successfully")
// });

// POST endpoint for adding a new customer
// app.post('/api/add_customer', async (req, res) => {
//     const data = req.body;
//     console.log(data);

//     const documents = await Customers.find({ user_name: data['user_name']});
//     if (documents.length > 0) {
//         res.send("User already exists");
//         return;
//     }

//     let hashedpwd = bcrypt.hashSync(data['password'], saltRounds)

//     // Creating a new instance of the Customers model with data from the request
//     const customer = new Customers({
//         "user_name": data['user_name'],
//         "age": data['age'],
//         "password": hashedpwd,
//         "email": data['email']
//     });

//     // Saving the new customer to the MongoDB 'customers' collection
//     await customer.save();

//     res.send("Customer added successfully")
// });

// Added the custom errors classes to the '/app/add_customer' endpoint
// POST endpoint for adding a new customer
app.post('/api/add_customer', async (req, res, next) => {
    const {
        Name,
        user_name,
        age,
        password,
        email
      } = req.body;

    const parsedAge = Number(age);
 
    try {
        if (!Name || typeof Name !== "string") {
            throw new ValidationError(
              "Name is required and must be a string"
            );
          }
        
        if (!user_name || typeof user_name !== "string") {
            throw new ValidationError(
              "Username is required and must be a string"
            );
          }

        if (!password || typeof password !== "string") {
            throw new ValidationError(
              "Password is required and must be a string"
            );
          }

        if (!email || typeof email !== "string") {
            throw new ValidationError(
              "Email is required and must be a string"
            );
          }
        

        if (!Number.isInteger(parsedAge)) {
            throw new ValidationError("Age must be a valid number");
          }
          
          
        if (parsedAge < 21) {
            throw new ValidationError("Customer must be at least 21 years old");
        }
        const documents = await Customers.find({ user_name: user_name});
        if (documents.length > 0) {
            throw new DuplicateUserError(
                "A customer with this username already exists"
              );
        }

        if (password.length < 8) {
            throw new ValidationError(
              "Password must contain at least 8 characters"
            );
        }
        const hashedPassword = await bcrypt.hash(
            password,
            saltRounds
          );
 
        const customer = new Customers({
            Name: Name.trim(),
            user_name: user_name.trim(),
            age: parsedAge,
            password: hashedPassword,
            email: email.trim().toLowerCase()
          });
 
        await customer.save();
 
        res.status(201).json({
            success: true,
            message: "Customer added successfully"
          })
    } catch (error) {
        if (error.code === 11000) {
          next(
            new DuplicateUserError(
              "A customer with this username already exists"
            )
          );
        }
        next(error);
      }
});



// Function to authenticate JWT token
function authenticateToken(req, res, next) {
    const authorizationHeader = req.headers['authorization'];
 
    if (!authorizationHeader) {
        res.sendStatus(401).json({
            message: "Authentication token is required"
          });
        return;
    }
    const token = authorizationHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
        message: "Invalid authorization header"
        });
    }
 
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            res.sendStatus(403).json({
                message: "Invalid or expired token"
              });
            return;
        }
 
        req.user = user;
        next();
    });
}

// Added the following middleware to handle all the invalid requests that come to the application.
app.all("*",(req,res,next)=>{
	const err = new Error(`Cannot find the URL ${req.originalUrl} in this application. Please check.`);
	err.status = "Endpoint Failure";
	err.statusCode = 404;
	next(err);
})

// The global error handler to this code.
app.use((err,req,res,next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "Error";
    console.log(err.stack);
	res.status(err.statusCode).json({
		status: err.statusCode,
		message: err.message,
	});
})



// Starting the server and listening on the specified port
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

