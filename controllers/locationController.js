// controllers/locationController.js
const Location = require('../models/Location');

exports.getLocation = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id).populate('address');
        res.status(200).json(location);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createLocation = async (req, res) => {
    const location = new Location(req.body);
    try {
        const savedLocation = await location.save();
        res.status(201).json(savedLocation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};