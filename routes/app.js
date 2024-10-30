const express = require('express');

module.exports = function () {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json({ message: 'Hello from /app route!' });
  });

  // Add additional routes as needed
  // Example: router.post('/submit', ...)

  return router;
};
