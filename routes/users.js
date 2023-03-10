var express = require('express');
var router = express.Router();

const mongoose = require('mongoose')

const bcryptjs = require('bcryptjs');
const saltRounds = 10;

const User = require('../models/User.model')

/* GET users listing. */
router.get('/signup', (req, res, next) => {
  res.render('users/signup.hbs')
});

router.post('/signup', (req, res, next) => {

  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    res.render('users/signup.hbs', { errorMessage: 'All fields are mandatory. Please provide your username, email and password.' });
    return;
  }
 
  bcryptjs
    .genSalt(saltRounds)
    .then((salt) => {
      return bcryptjs.hash(password, salt)
    })
    .then((hashedPassword) => {
      return User.create({
        fullName,
        email,
        password: hashedPassword
      });
    })
    .then((userFromDB) => {
      console.log('Newly created user is: ', userFromDB);
      res.redirect('/users/login')
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render('users/signup.hbs', { errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).render('users/signup.hbs', {
           errorMessage: 'Username and email need to be unique. Either username or email is already used.'
        });
      } else {
        next(error);
      }
    })

})

router.get('/login', (req, res, next) => {
  res.render('users/login.hbs')
});

router.post('/login', (req, res, next) => {
  const { email, password } = req.body;
 
  if (!email || !password) {
    res.render('users/login.hbs', {
      errorMessage: 'Please enter both, email and password to login.'
    });
    return;
  }
 
  User.findOne({ email })
    .then(user => {
      if (!user) {
        res.render('users/login.hbs', { errorMessage: 'Email is not registered. Try with other email.' });
        return;
      } else if (bcryptjs.compareSync(password, user.password)) {
        req.session.user = user
        res.redirect('/');
      } else {
        res.render('users/login.hbs', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch(error => next(error));
});

router.get('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) next(err);
    res.redirect('/');
  });
});

module.exports = router;
