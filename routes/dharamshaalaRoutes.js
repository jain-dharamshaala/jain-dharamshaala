// routes/dharamshaalaRoutes.js
const express = require('express');
const router = express.Router();
// const upload = require('../config/multerConfig');
const {upload} = require('../config/upload');
const dharamshaalaController = require('../controllers/dharamshaalaController');

router.get('/search', dharamshaalaController.searchDharamshaalas);
router.get('/:dharamshaalaId/get-availability', dharamshaalaController.getDharamshaalaCurrentAvailabilityForBooking);

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
router.delete('/bookings/:bookingId', dharamshaalaController.unreserveRoom);
router.get('/rooms/:roomId/bookings', dharamshaalaController.getBookingHistoryOfRoom);
// router.post('/check-availability', dharamshaalaController.checkAvailability);


router.get('/images/:filename', (req, res) => {
    const { filename } = req.params;
    const params = {
      Bucket: 'jain-dharamshaala',
      Key: filename,
    };
  
    s3Client.getObject(params, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error retrieving image');
      }
  
      res.set('Content-Type', data.ContentType);
      res.send(data.Body);
    });
  });





module.exports = router;
