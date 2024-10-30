const express = require('express');

module.exports = function (passport) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json({ message: 'Hello from root route!' });
  });

  // Add additional routes as needed
  // Example: router.get('/profile', passport.authenticate(...))

  return router;
};
