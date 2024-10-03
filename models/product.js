"use strict";

// Import necessary modules
const Sequelize = require("sequelize");

// Initialize the Sequelize instance with environment variables
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || "mysql", // Default to MySQL
});

// Define the Product model
module.exports = function () {
    var Product = sequelize.define("Product", {
        id: {
            type: Sequelize.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        code: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        name: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.DataTypes.TEXT,
            allowNull: false
        },
        tags: {
            type: Sequelize.DataTypes.STRING
        }
    });

    return Product;
};
