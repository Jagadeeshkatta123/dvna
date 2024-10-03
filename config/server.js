module.exports = {
    listen: process.env.APP_LISTEN || '0.0.0.0',
    port: process.env.APP_PORT || process.env.PORT || 9090,
    database: {
      port: process.env.MYSQL_PORT || 3306,  // Database port for MySQL
      dialect: 'mysql'                       // SQL dialect
    }
  }
  