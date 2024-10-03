const mysql = require('mysql');
const bCrypt = require('bcrypt');
const md5 = require('md5');

// MySQL connection setup
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Function to check if user is authenticated
exports.isAuthenticated = async function(event, context) {
  const isAuthenticated = event.headers['is-authenticated'];
  if (isAuthenticated) {
    return {
      statusCode: 200,
      body: JSON.stringify({ authenticated: true })
    };
  } else {
    return {
      statusCode: 302,
      headers: { Location: '/login' },
    };
  }
};

// Function to check if user is not authenticated
exports.isNotAuthenticated = async function(event, context) {
  const isAuthenticated = event.headers['is-authenticated'];
  if (!isAuthenticated) {
    return {
      statusCode: 200,
      body: JSON.stringify({ notAuthenticated: true })
    };
  } else {
    return {
      statusCode: 302,
      headers: { Location: '/learn' },
    };
  }
};

// Function to handle password reset request
exports.forgotPw = async function(event, context) {
  const requestBody = JSON.parse(event.body);
  const { login } = requestBody;

  if (login) {
    connection.query(
      'SELECT * FROM Users WHERE login = ?', 
      [login], 
      function(error, results) {
        if (results.length) {
          // Logic for sending reset link via email can be added here
          return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Check email for reset link' }),
          };
        } else {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid login username' }),
          };
        }
      }
    );
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid login username' }),
    };
  }
};

// Function to reset password using token
exports.resetPw = async function(event, context) {
  const { login, token } = event.queryStringParameters;

  if (login) {
    connection.query(
      'SELECT * FROM Users WHERE login = ?', 
      [login], 
      function(error, results) {
        if (results.length) {
          const user = results[0];
          if (token === md5(login)) {
            return {
              statusCode: 200,
              body: JSON.stringify({
                login: login,
                token: token,
              }),
            };
          } else {
            return {
              statusCode: 400,
              body: JSON.stringify({ error: 'Invalid reset token' }),
            };
          }
        } else {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid login username' }),
          };
        }
      }
    );
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Nonexistent login username' }),
    };
  }
};

// Function to handle password reset form submission
exports.resetPwSubmit = async function(event, context) {
  const requestBody = JSON.parse(event.body);
  const { password, cpassword, login, token } = requestBody;

  if (password && cpassword && login && token) {
    if (password === cpassword) {
      connection.query(
        'SELECT * FROM Users WHERE login = ?', 
        [login], 
        function(error, results) {
          if (results.length) {
            const user = results[0];
            if (token === md5(login)) {
              const hashedPassword = bCrypt.hashSync(password, bCrypt.genSaltSync(10));
              connection.query(
                'UPDATE Users SET password = ? WHERE login = ?', 
                [hashedPassword, login], 
                function(error, results) {
                  return {
                    statusCode: 200,
                    body: JSON.stringify({ success: 'Password successfully reset' }),
                  };
                }
              );
            } else {
              return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid reset token' }),
              };
            }
          } else {
            return {
              statusCode: 400,
              body: JSON.stringify({ error: 'Invalid login username' }),
            };
          }
        }
      );
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Passwords do not match' }),
      };
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request' }),
    };
  }
};
