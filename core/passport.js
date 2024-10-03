const mysql = require('mysql');
const LocalStrategy = require('passport-local').Strategy;
const bCrypt = require('bcrypt');

// Create a MySQL connection using environment variables
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Export passport configuration as a Netlify function
module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (uid, done) {
        const query = 'SELECT * FROM User WHERE id = ?';
        connection.query(query, [uid], function (error, results) {
            if (error) return done(error);
            if (results.length > 0) {
                done(null, results[0]);
            } else {
                done(null, false);
            }
        });
    });

    passport.use('login', new LocalStrategy({
            passReqToCallback: true
        },
        function (req, username, password, done) {
            const query = 'SELECT * FROM User WHERE login = ?';
            connection.query(query, [username], function (error, results) {
                if (error) return done(error);
                if (results.length === 0) {
                    return done(null, false, req.flash('danger', 'Invalid Credentials'));
                }
                const user = results[0];
                if (!isValidPassword(user, password)) {
                    return done(null, false, req.flash('danger', 'Invalid Credentials'));
                }
                return done(null, user);
            });
        })
    );

    passport.use('signup', new LocalStrategy({
            passReqToCallback: true
        },
        function (req, username, password, done) {
            const findOrCreateUser = function () {
                const query = 'SELECT * FROM User WHERE email = ?';
                connection.query(query, [username], function (error, results) {
                    if (error) return done(error);
                    if (results.length > 0) {
                        return done(null, false, req.flash('danger', 'Account Already Exists'));
                    } else {
                        if (req.body.email && req.body.password && req.body.username && req.body.cpassword && req.body.name) {
                            if (req.body.cpassword == req.body.password) {
                                const insertQuery = 'INSERT INTO User (email, password, name, login) VALUES (?, ?, ?, ?)';
                                const hashedPassword = createHash(password);
                                connection.query(insertQuery, [req.body.email, hashedPassword, req.body.name, username], function (error, result) {
                                    if (error) return done(error);
                                    const newUser = { id: result.insertId, email: req.body.email, name: req.body.name };
                                    return done(null, newUser);
                                });
                            } else {
                                return done(null, false, req.flash('danger', 'Passwords do not match'));
                            }
                        } else {
                            return done(null, false, req.flash('danger', 'Input field(s) missing'));
                        }
                    }
                });
            };
            process.nextTick(findOrCreateUser);
        })
    );

    const isValidPassword = function (user, password) {
        return bCrypt.compareSync(password, user.password);
    };

    const createHash = function (password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
};
