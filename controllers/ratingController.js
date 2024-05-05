// controllers/ratingController.js
const UserRating = require('../models/UserRating');
const Rating = require('../models/Rating');
const Dharamshaala = require('../models/Dharamshaala');
const Booking = require('../models/Booking');


exports.getDharamshaalaRating = async (req, res) => {
    try {
        const ratings = await Rating.find({ dharamshaala: req.params.dharamshaalaId });
        res.status(200).json(ratings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createUserRating = async (req, res) => {
    // Check if the dharamshaala exists
    const dharamshaala = await Dharamshaala.findById(req.body.dharamshaalaId);
    if (!dharamshaala) {
        return res.status(404).json({ message: 'Dharamshaala not found' });
    }

    // Check if the booking exists
    const booking = await Booking.findById(req.body.bookingId);
    if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the booking belongs to the user
    if (booking.customer_id.toString() !== req.body.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if an entry already exists for the same combination
    const existingRating = await UserRating.findOne({
        user: req.body.userId,
        dharamshaala: req.body.dharamshaalaId,
        booking: req.body.bookingId
    });
    // if (existingRating) {
    //     return res.status(409).json({ message: 'Rating already exists for this combination' });
    // }
    const userRating = new UserRating({
        user: req.body.userId,
        dharamshaala: req.body.dharamshaalaId,
        booking: req.body.bookingId,
        rating: req.body.rating,
        comment: req.body.comment,
    });
    try {
        const savedUserRating = await userRating.save();
        const rating = await Rating.findOne({ dharamshaala: req.body.dharamshaalaId });
        if (!rating) {
            // Create a new rating entry if it doesn't exist
            const newRating = new Rating({
                dharamshaala: req.body.dharamshaalaId,
                count: 1,
                rating: req.body.rating,
                rating_breakup: [
                    {
                        rating: req.body.rating,
                        count: 1
                    }
                ]
            });
            await newRating.save();
        } else {
            // Update the existing rating entry
            rating.count += 1;
            const ratingBreakup = rating.rating_breakup.find(rb => rb.rating === req.body.rating);
            if (ratingBreakup) {
                ratingBreakup.count += 1;
            } else {
                rating.rating_breakup.push({
                    rating: req.body.rating,
                    count: 1
                });
            }
            await rating.save();
        }
        res.status(201).json(savedUserRating);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};