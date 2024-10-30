const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const mainRoute = require('../routes/main'); // Adjust path if necessary

// Initialize Express
const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// Initialize Passport
require('../core/passport')(passport); // Adjust path if necessary
app.use(passport.initialize());
app.use(passport.session());

// Define the root (/) route using the logic from routes/main
app.use('/', mainRoute(passport));

// Export the handler function for Netlify
module.exports.handler = serverless(app);
