const express = require('express');
const serverless = require('serverless-http'); // Needed to handle Express in serverless
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const appRoute = require('../routes/app'); // Adjust path if necessary

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

// Define the /app route using the logic from routes/app
app.use('/app', appRoute());

// Export the handler function for Netlify
module.exports.handler = serverless(app);
