var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mysql = require('mysql');
var usersRouter = require('./routes/users');
const dotenv = require('dotenv');
dotenv.config();
var app = express();
const upload = require('./routes/config').upload;
const assementRouter = require("./routes/iamarks");
const resultRouter = require("./routes/results");
const studentRouter = require("./routes/students");
const attendenceRouter = require("./routes/attendance");
const subjectRouter = require("./routes/subjectAllotment")
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Database connection
const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD, 
  database: process.env.MYSQL_DATABASE
};

let db; // Declare a variable to store the database connection 
let dbReady = false; // Flag to indicate if the database connection is ready

// Function to establish the database connection
function connectToDB() {
  db = mysql.createConnection(dbConfig);

  db.connect((err) => {
    if (err) {
      console.error('Database connection error:', err);
    } else {
      console.log('Connected to the database');
      dbReady = true; // Set the flag to true once the connection is established
    }
  });
}

// Call the connectToDB function to establish the connection when the application starts
connectToDB();

app.use((req, res, next) => {
  if (dbReady) {
    req.db = db; // Reuse the existing connection
    next();
  } else {
    // Wait until the database connection is ready before proceeding to the next middleware
    const checkDBReady = () => {
      if (dbReady) {
        req.db = db; // Reuse the existing connection
  
        next();
      } else {
        setTimeout(checkDBReady, 100); // Check again after a short delay
      }
    };
    checkDBReady();
  }
});
const xlsx = require('xlsx');
app.use('/users', usersRouter);
app.use('/assesment', assementRouter);
app.use('/results', resultRouter);
app.use('/students', studentRouter);
app.use('/subjects', subjectRouter);
app.use('/attendance', attendenceRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.send("Error");
// });

module.exports = app;