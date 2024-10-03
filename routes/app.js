const appHandler = require('../core/appHandler');
const authHandler = require('../core/authHandler');

exports.handler = async function(event, context) {
    // Authenticate user first
    const isAuthenticated = await authHandler.isAuthenticated(event, context);

    if (!isAuthenticated) {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Unauthorized' })
        };
    }

    // Routing logic based on the request path
    const { httpMethod, path } = event;

    switch (path) {
        case '/':
            return {
                statusCode: 302,
                headers: {
                    Location: '/learn'
                }
            };
        
        case '/usersearch':
            if (httpMethod === 'GET') {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ output: null }) // Replace with rendered view logic if needed
                };
            } else if (httpMethod === 'POST') {
                return await appHandler.userSearch(event, context);
            }
            break;

        case '/ping':
            if (httpMethod === 'GET') {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ output: null }) // Replace with rendered view logic if needed
                };
            } else if (httpMethod === 'POST') {
                return await appHandler.ping(event, context);
            }
            break;

        case '/bulkproducts':
            if (httpMethod === 'GET') {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ legacy: event.queryStringParameters.legacy }) // Replace with rendered view logic if needed
                };
            } else if (httpMethod === 'POST') {
                return await appHandler.bulkProducts(event, context);
            }
            break;

        case '/products':
            return await appHandler.listProducts(event, context);

        case '/modifyproduct':
            if (httpMethod === 'GET') {
                return await appHandler.modifyProduct(event, context);
            } else if (httpMethod === 'POST') {
                return await appHandler.modifyProductSubmit(event, context);
            }
            break;

        case '/useredit':
            if (httpMethod === 'GET') {
                return await appHandler.userEdit(event, context);
            } else if (httpMethod === 'POST') {
                return await appHandler.userEditSubmit(event, context);
            }
            break;

        case '/calc':
            if (httpMethod === 'GET') {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ output: null }) // Replace with rendered view logic if needed
                };
            } else if (httpMethod === 'POST') {
                return await appHandler.calc(event, context);
            }
            break;

        case '/admin':
            return {
                statusCode: 200,
                body: JSON.stringify({ admin: (context.user.role === 'admin') }) // Replace with rendered view logic if needed
            };

        case '/admin/usersapi':
            return await appHandler.listUsersAPI(event, context);

        case '/admin/users':
            return {
                statusCode: 200,
                body: JSON.stringify({}) // Replace with rendered view logic if needed
            };

        case '/redirect':
            return await appHandler.redirect(event, context);

        default:
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Not Found' })
            };
    }
};
