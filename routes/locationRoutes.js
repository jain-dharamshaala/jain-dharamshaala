// routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/:id', locationController.getLocation);
router.post('/', locationController.createLocation);

module.exports = router;