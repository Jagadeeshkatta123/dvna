const vulnDict = require('../config/vulns'); // Adjust the path if needed
const authHandler = require('../core/authHandler'); // Adjust the path if needed

// Export a function to handle HTTP requests
exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;

  // Helper function to render views (you'll need to implement this)
  const renderView = (viewName, data) => {
    // Render logic using your templating engine or alternative
    // For now, we return a placeholder response
    return {
      statusCode: 200,
      body: JSON.stringify({ view: viewName, data })
    };
  };

  // Handle different routes based on the request path
  switch (path) {
    case '/':
      // Implement your authentication check here
      if (authHandler.isAuthenticated(context)) {
        return {
          statusCode: 302,
          headers: {
            Location: '/learn'
          }
        };
      }
      break;

    case '/login':
      if (!authHandler.isAuthenticated(context)) {
        return renderView('login', {});
      }
      break;

    case '/learn/vulnerability':
      const vulnParam = body.vuln; // Assuming this is sent as part of the request body
      if (authHandler.isAuthenticated(context)) {
        return renderView('vulnerabilities/layout', {
          vuln: vulnParam,
          vuln_title: vulnDict[vulnParam],
          vuln_scenario: `${vulnParam}/scenario`,
          vuln_description: `${vulnParam}/description`,
          vuln_reference: `${vulnParam}/reference`,
          vulnerabilities: vulnDict
        });
      }
      break;

    case '/learn':
      if (authHandler.isAuthenticated(context)) {
        return renderView('learn', { vulnerabilities: vulnDict });
      }
      break;

    case '/register':
      if (!authHandler.isAuthenticated(context)) {
        return renderView('register', {});
      }
      break;

    case '/logout':
      // Implement logout logic here
      authHandler.logout(context);
      return {
        statusCode: 302,
        headers: {
          Location: '/'
        }
      };

    case '/forgotpw':
      return renderView('forgotpw', {});

    case '/resetpw':
      // Handle reset password logic
      return authHandler.resetPw(context);

    case '/login':
      if (httpMethod === 'POST') {
        return passport.authenticate('login', {
          successRedirect: '/learn',
          failureRedirect: '/login',
          failureFlash: true
        })(context); // Implement this based on your logic
      }
      break;

    case '/register':
      if (httpMethod === 'POST') {
        return passport.authenticate('signup', {
          successRedirect: '/learn',
          failureRedirect: '/register',
          failureFlash: true
        })(context); // Implement this based on your logic
      }
      break;

    case '/forgotpw':
      if (httpMethod === 'POST') {
        return authHandler.forgotPw(context);
      }
      break;

    case '/resetpw':
      if (httpMethod === 'POST') {
        return authHandler.resetPwSubmit(context);
      }
      break;

    default:
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Not Found' })
      };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: 'Method Not Allowed' })
  };
};
