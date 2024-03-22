// routes/dharamshaalaRoutes.js
const express = require('express');
const router = express.Router();
// const upload = require('../config/multerConfig');
const upload = require('../config/upload');
const dharamshaalaController = require('../controllers/dharamshaalaController');


// Define routes for Dharamshaala CRUD operations
router.get('/', dharamshaalaController.getAllDharamshaalas);
router.post('/', upload.array('images', 5),dharamshaalaController.createDharamshaala);
router.get('/:id', dharamshaalaController.getDharamshaalaById);
router.put('/:id', dharamshaalaController.updateDharamshaala);
router.delete('/:id', dharamshaalaController.deleteDharamshaala);


// dharamshaala feature routes.
router.get('/:dharamshaalaId/rooms', dharamshaalaController.getAllRoomsOfDharamshaala);
router.post('/:dharamshaalaId/rooms', dharamshaalaController.addRoomToDharamshaala);
router.delete('/:dharamshaalaId/rooms/:roomId', dharamshaalaController.removeRoomFromDharamshaala);
router.post('/rooms/:roomId/reserve', dharamshaalaController.reserveRoom);
router.delete('/bookings/:bookingId', dharamshaalaController.unreserveRoom);
router.put('/bookings/:bookingId/accept', dharamshaalaController.acceptBooking);
router.put('/bookings/:bookingId/reject', dharamshaalaController.rejectBooking);
router.get('/rooms/:roomId/bookings', dharamshaalaController.getBookingHistoryOfRoom);
router.post('/check-availability', dharamshaalaController.checkAvailability);



module.exports = router;
