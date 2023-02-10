var express = require('express');
var router = express.Router();

const { isLoggedIn } = require('../middleware/route-guard')

const Room = require('../models/Room.model')

router.get('/all-rooms', (req, res, next) => {

    Room.find()
    .populate('owner')
    .then((foundRooms) => {
        res.render('rooms/all-rooms.hbs', { foundRooms });
    })
    .catch((err) => {
        console.log(err)
    })

});

router.get('/create-room', isLoggedIn, (req, res, next) => {
  res.render('rooms/create-room.hbs');
});

router.post('/create-room', isLoggedIn, (req, res, next) => {

    const { name, description, imageUrl } = req.body

    Room.create({
        name,
        description,
        imageUrl,
        owner: req.session.user._id
    })
    .then((createdRoom) => {
        console.log(createdRoom)
        res.redirect('/rooms/all-rooms')
    })
    .catch((err) => {
        console.log(err)
    })

})

router.get('/details/:id', (req, res, next) => {
    
    Room.findById(req.params.id)
    .populate('owner')
    .then((foundRoom) => {
        res.render('rooms/room-details.hbs', foundRoom)
    })
    .catch((err) => {
        console.log(err)
    })

})

module.exports = router;