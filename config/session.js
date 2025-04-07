//config session file for user
const session = require('express-session');
const MongoStore = require('connect-mongo');

const configureSession = (app) => {
  app.use(session({
    secret: process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  }));

  // Set global user variable
  app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
  });
};

module.exports = configureSession;