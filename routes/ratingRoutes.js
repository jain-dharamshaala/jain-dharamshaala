
const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

router.post('/save', ratingController.createUserRating);
router.get('/:dharamshaalaId', ratingController.getDharamshaalaRating);

module.exports = router;