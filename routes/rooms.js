var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/all-rooms', (req, res, next) => {
  res.render('rooms/all-rooms.hbs');
});

router.get('/create-room', (req, res, next) => {
  res.render('rooms/create-room.hbs');
});

module.exports = router;