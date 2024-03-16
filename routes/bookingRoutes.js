// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticateUser = require('../middleware/authenticateMiddleware');

// Define routes for Booking functionalities
router.post('/search', bookingController.searchDharamshaalasByDates);
router.post('/book', authenticateUser, bookingController.bookRoom);
router.post('/cancel/:id', authenticateUser, bookingController.cancelBooking);
router.get('/mybookings', authenticateUser, bookingController.getCustomerBookings);

module.exports = router;
