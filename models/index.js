"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

// Netlify's environment variables for database connection
const env = process.env.NODE_ENV || "development";

// Check for Netlify environment variables for MySQL
const databaseUrl = process.env.DATABASE_URL;

// Database connection setup using Sequelize
let sequelize;

// If DATABASE_URL exists, use it for Heroku-like setups, otherwise use custom MySQL setup
if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl);
} else {
  // Use environment variables for MySQL setup
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "mysql", // Default to MySQL
    logging: false, // Disable logging for performance
  });
}

// Authenticate with the database
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });

// Sync Sequelize models (tables)
sequelize
  .sync(/* { force: true } */) // Uncomment for forceful table recreation
  .then(() => {
    console.log("It worked! Tables synced.");
  })
  .catch(err => {
    console.error("An error occurred while creating the table:", err);
  });

// Load all models in the directory
let db = {};

// Read through the current directory and import each model
fs
  .readdirSync(__dirname)
  .filter(file => file.indexOf(".") !== 0 && file !== "index.js")
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

// Setup associations if available
Object.keys(db).forEach(modelName => {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

// Export the db and Sequelize instance for use
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
