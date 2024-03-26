// routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Define routes for Room CRUD operations
router.get('/', roomController.getAllRooms);
router.post('/', roomController.createRoom);
router.get('/:id', roomController.getRoomById);
router.put('/:id', roomController.upsertRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;
