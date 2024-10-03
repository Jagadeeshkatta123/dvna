const mysql = require('mysql');
const bCrypt = require('bcrypt');
const exec = require('child_process').exec;
const mathjs = require('mathjs');
const libxmljs = require("libxmljs");
const serialize = require("node-serialize");
const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

// Setup MySQL connection for the serverless function
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Netlify Function Handlers

// User Search
exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  const query = "SELECT name,id FROM Users WHERE login='" + body.login + "'";
  
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ message: "Internal Error" })
        });
      } else if (results.length) {
        resolve({
          statusCode: 200,
          body: JSON.stringify({
            user: {
              name: results[0].name,
              id: results[0].id
            }
          })
        });
      } else {
        resolve({
          statusCode: 404,
          body: JSON.stringify({ message: "User not found" })
        });
      }
    });
  });
};

// Ping Function
exports.ping = async (event, context) => {
  const body = JSON.parse(event.body);
  return new Promise((resolve, reject) => {
    exec('ping -c 2 ' + body.address, (err, stdout, stderr) => {
      const output = stdout + stderr;
      resolve({
        statusCode: 200,
        body: JSON.stringify({ output })
      });
    });
  });
};

// List Products
exports.listProducts = async (event, context) => {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM Products", (error, results) => {
      if (error) {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ message: "Internal Error" })
        });
      } else {
        resolve({
          statusCode: 200,
          body: JSON.stringify({ products: results })
        });
      }
    });
  });
};

// Product Search
exports.productSearch = async (event, context) => {
  const body = JSON.parse(event.body);
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM Products WHERE name LIKE ?",
      ['%' + body.name + '%'],
      (error, results) => {
        if (error) {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Error" })
          });
        } else {
          resolve({
            statusCode: 200,
            body: JSON.stringify({ products: results, searchTerm: body.name })
          });
        }
      }
    );
  });
};

// Modify Product
exports.modifyProductSubmit = async (event, context) => {
  const body = JSON.parse(event.body);
  const productId = body.id || 0;

  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM Products WHERE id = ?",
      [productId],
      (error, results) => {
        if (error) {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Error" })
          });
        } else {
          let product = results.length ? results[0] : {};

          // Update product fields
          product.code = body.code;
          product.name = body.name;
          product.description = body.description;
          product.tags = body.tags;

          connection.query(
            "UPDATE Products SET ? WHERE id = ?",
            [product, productId],
            (err) => {
              if (err) {
                resolve({
                  statusCode: 500,
                  body: JSON.stringify({ message: "Error modifying product" })
                });
              } else {
                resolve({
                  statusCode: 200,
                  body: JSON.stringify({ message: "Product modified successfully" })
                });
              }
            }
          );
        }
      }
    );
  });
};

// User Edit
exports.userEditSubmit = async (event, context) => {
  const body = JSON.parse(event.body);

  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM Users WHERE id = ?",
      [body.id],
      (error, results) => {
        if (error) {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Error" })
          });
        } else {
          const user = results[0];
          if (body.password.length > 0 && body.password === body.cpassword) {
            user.password = bCrypt.hashSync(body.password, bCrypt.genSaltSync(10), null);
          } else {
            resolve({
              statusCode: 400,
              body: JSON.stringify({ message: "Passwords don't match or invalid" })
            });
            return;
          }
          user.email = body.email;
          user.name = body.name;

          connection.query(
            "UPDATE Users SET ? WHERE id = ?",
            [user, body.id],
            (err) => {
              if (err) {
                resolve({
                  statusCode: 500,
                  body: JSON.stringify({ message: "Error updating user" })
                });
              } else {
                resolve({
                  statusCode: 200,
                  body: JSON.stringify({ message: "User updated successfully" })
                });
              }
            }
          );
        }
      }
    );
  });
};
