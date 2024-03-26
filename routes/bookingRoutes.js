// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticateUser = require('../middleware/authenticateMiddleware');

// Define routes for Booking functionalities
router.post('/search', bookingController.searchDharamshaalasByDates);
// router.post('/book', authenticateUser, bookingController.bookRoom);
router.post('/book', bookingController.bookRoom);
router.post('/cancel/:id', bookingController.cancelBooking); // cancel is done by customer
router.get('/mybookings', authenticateUser, bookingController.getCustomerBookings);

router.get('/dharamshaala/:id/bookings', authenticateUser, bookingController.getDharamshalaBookings);
router.put('/:bookingId/accept', bookingController.acceptBooking);
router.put('/:bookingId/reject', bookingController.rejectBooking); // rejection is done by Dharamshaala Manager

module.exports = router;
