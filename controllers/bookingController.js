// controllers/bookingController.js
const Booking = require('../models/Booking');

// Controller function to search Dharamshaalas by dates
exports.searchDharamshaalasByDates = async (req, res) => {
  try {
    // Implement logic to search Dharamshaalas by dates
    // Example:
    const checkinDate = new Date(req.body.checkin_date);
    const checkoutDate = new Date(req.body.checkout_date);

    const availableDharamshaalas = await Booking.find({
      checkin_date: { $lte: checkinDate },
      checkout_date: { $gte: checkoutDate }
    }).populate('dharamshaala_id');

    res.json(availableDharamshaalas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to book a room
exports.bookRoom = async (req, res) => {
  const booking = new Booking({
    dharamshaala_id: req.body.dharamshaala_id,
    room_id: req.body.room_id,
    customer_id: req.user.id, // Assuming user is authenticated and user ID is available in req.user
    checkin_date: req.body.checkin_date,
    checkout_date: req.body.checkout_date,
    per_night_price: req.body.per_night_price,
    total_price: req.body.total_price,
    status: 'confirmed' // Set status to confirmed by default
  });

  try {
    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller function to cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const canceledBooking = await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!canceledBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(canceledBooking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to get customer bookings
exports.getCustomerBookings = async (req, res) => {
  try {
    const customerBookings = await Booking.find({ customer_id: req.user.id }).populate('dharamshaala_id room_id');
    res.json(customerBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
