const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const logger = require('morgan');

const passport = require('passport')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session);

const indexRouter = require('./routes');
const usersRouter = require('./routes/users');
const adminRoutes = require('./routes/admin');
const errorsRouter = require('./routes/errors');
const authRoutes = require('./routes/auth');
const organisationRoutes = require('./routes/organisation');
const offresRoutes = require('./routes/offres');

const passportCfg = require('./models/utils/passeport')
passportCfg(passport);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: "CECI_EST_UNE_CLEF_SECRETE_DE_SESSION_QUI_NE_DOIT_PAS_ETRE_PUBLIQUE_SR10_!",
  resave: false,
  saveUninitialized: false,
  cookie: {
    name: '__session',
    secure : false,
    httpOnly : true,
    maxAge: 1000*60*60,
  },
  store: new MySQLStore({
    host:'',
    port:3306,
    user:'',
    password:'',
    database:'session_cookie'
  }),
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'files')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/error', errorsRouter);
app.use('/authentification', authRoutes);
app.use('/organisations', organisationRoutes);
app.use('/offres', offresRoutes);
app.use('/administration', adminRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log("404")
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log("ERR -- ICI")
  console.log(err)

  // render the error page
  res.status(err.status || 500);
  if ((err.status || 500) === 404) {
    res.render('errors/error-404');
  } else if ((err.status || 500) === 500) {
    res.render('errors/error-500');
  }
});

module.exports = app;
