require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const logger = require('morgan');
const { passport } = require('./config/jwtConfig');
const configureFacebookJwt = require('./config/facebookConfig');
const configureGoogleJwt = require('./config/googleConfig');
const articleRouter = require('./routes/articleRouter');
const userRouter = require('./routes/userRouter');

const app = express();
const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/newspapers';

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
configureFacebookJwt(app, passport);
configureGoogleJwt(app, passport);

app.get('/', function (req, res) {
  res.json({
    message: 'Exercise 27 - Facebook and Google OAuth to JWT REST API',
    status: 'deploy thành công',
    login: '/users/login',
    facebookLogin: '/auth/facebook',
    googleLogin: '/auth/google',
    articles: '/articles'
  });
});

app.use('/users', userRouter);
app.use('/articles', articleRouter);

app.use(function (req, res) {
  res.status(404).json({ message: 'Route not found' });
});

app.use(function (err, req, res, next) {
  const statusCode = err.name === 'ValidationError' || err.name === 'CastError'
    ? 400
    : err.status || 500;

  res.status(statusCode).json({ message: err.message });
});

mongoose.connect(mongoUrl)
  .then(function () {
    console.log('Connected to MongoDB successfully');
  })
  .catch(function (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
