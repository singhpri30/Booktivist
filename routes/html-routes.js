const path = require('path');
const router = require('express').Router();
const db = require('../models');

// Requiring our custom middleware for checking if a user is logged in
const isAuthenticated = require('../config/middleware/isAuthenticated');
const isAdmin = require('../config/middleware/isAdmin');

// home page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// route to login page - see below-working
// If the user already has an account send them to the mylibrary page
router.get('/login', (req, res) => {
  if (req.user) {
    res.redirect('/mylibrary');
  }
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// route to signup page,working
router.get('/signup', (req, res) => {
  // If the user already has an account send them to the mylibrary page
  if (req.user) {
    res.redirect('/mylibrary');
  }
  res.sendFile(path.join(__dirname, '../public/signup.html'));
});

// route to about page
router.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/about.html'));
});

// route to category page
router.get('/categories', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/categories.html'));
});

// route to my library - see below, working
// Here we've add our isAuthenticated middleware to this route.
// If a user who is not logged in tries to access this route they
// will be redirected to the signup page

// get all the books for logged in user
router.get('/mylibrary', isAuthenticated, (req, res) => {
  db.Book.findAll({
    include: [{
      model: db.User,
      as: 'users',
      where: {
        id: req.user.id,
      },
      attributes: ['id', 'firstName', 'lastName'],
      through: {
        // This block of code allows you to retrieve the properties of the join table
        model: db.UserBooks,
        as: 'userBooks',
        attributes: ['bookId'],
      },
    }],
  })
    .then((dbUserBook) => {
      res.json(dbUserBook);
      // res.sendFile(path.join(__dirname, '../public/mylibrary.html'));
    }).catch((err) => {
      res.status(401).json(err);
    });
});

// user is redirected to addbook page if the user is loggedin
router.get('/addbook', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/addbook.html'));
});

router.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/adminLogin.html'));
});
// for admin login
// router.get('/admin/login', (req, res) => {
//   // if (req.user) {
//   //   res.redirect('/admin/review');
//   // }
//   res.sendFile(path.join(__dirname, '../public/adminLogin.html'));
// });

router.get('/admin/review', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/adminReview.html'));
});


module.exports = router;
