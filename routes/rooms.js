var express = require('express');
var router = express.Router();

const { isLoggedIn, isOwner, isNotOwner } = require('../middleware/route-guard')

const Room = require('../models/Room.model')

const Review = require('../models/Review.model')

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
    .populate({
        path: "reviews",
        populate: {path: "user"}
    })
    .then((foundRoom) => {
        res.render('rooms/room-details.hbs', foundRoom)
    })
    .catch((err) => {
        console.log(err)
    })

})

router.get('/edit/:id', isOwner, (req, res, next) => {

    Room.findById(req.params.id)
    .then((foundRoom) => {
        res.render('rooms/edit-room.hbs', foundRoom)
    })
    .catch((err) => {
        console.log(err)
    })
})

router.post('/edit/:id', (req, res, next) => {
    const { name, description, imageUrl } = req.body
    Room.findByIdAndUpdate(req.params.id, 
        {
            name, 
            description,
            imageUrl
        },
        {new: true})
    .then((updatedRoom) => {
        console.log(updatedRoom)
        res.redirect(`/rooms/details/${req.params.id}`)
    })
    .catch((err) => {
        console.log(err)
    })
}) 

router.get('/delete/:id', isOwner, (req, res, next) => {
    Room.findByIdAndDelete(req.params.id)
    .then((confirmation) => {
        console.log(confirmation)
        res.redirect('/rooms/all-rooms')
    })
    .catch((err) => {
        console.log(err)
    })
})

router.post('/add-review/:id', isNotOwner, (req, res, next) => {

    Review.create({
        user: req.session.user._id,
        comment: req.body.comment
    })
    .then((newReview) => {
       return Room.findByIdAndUpdate(req.params.id, 
            {
                $push: {reviews: newReview._id}
            },
            {new: true})
    })
    .then((roomWithReview) => {
        console.log(roomWithReview)
        res.redirect(`/rooms/details/${req.params.id}`)
    })
    .catch((err) => {
        console.log(err)
    })
})

module.exports = router;