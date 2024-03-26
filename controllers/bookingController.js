// controllers/bookingController.js
const Booking = require('../models/Booking');
const moment = require('moment');

const {numberOfNights} = require('../utils/bookingHelper')
const {sendBookingAcknowledgment} = require('../modules/email/emailSender')

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
  try {
    const {checkinDate, checkoutDate, customerId, perNightPrice,dharamshaala_id,room_id} = req.body;
    const booking = new Booking({
        room_id: room_id,
        dharamshaala_id: dharamshaala_id,
        checkin_date: checkinDate,
        checkout_date: checkoutDate,
        customer_id: customerId,
        per_night_price: perNightPrice,
        total_price: perNightPrice * numberOfNights(checkinDate, checkoutDate),
        status: 'pending'
    });
    // TODO add validation to check if room is available
    const isRoomAvailable = await Booking.findOne({
      room_id: room_id,
      checkin_date: { $lt: checkoutDate },
      checkout_date: { $gt: checkinDate },
      status: { $in: ['pending', 'confirmed'] }
    });
    if (isRoomAvailable) {
      throw new Error('Room is not available for the selected dates');
    }
    const savedBooking = await booking.save();
    sendBookingAcknowledgment(savedBooking,'pending')
    res.json(savedBooking);
} catch (error) {
    console.log(error.message);
    res.json({message : "Selected Room is not available for the selected dates. Please select other room."})
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
    
    //const customerBookings = await Booking.find({ customer_id: req.session.userId }).populate('dharamshaala_id room_id');
    const customerBookings = await Booking.find({ customer_id: req.session.userId })
      .populate({ path: 'dharamshaala_id', as: 'dharamshaala' })
      .populate({ path: 'room_id', as: 'room' });
      // populate the room and dharamshaala fields but alias is not working.
    res.json(customerBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDharamshalaBookings = async (req, res) => {
  const dharamshalaId = req.params.id;
  const today = moment().startOf('day');

  try {
    const bookings = await Booking.find({
      dharamshaala_id: dharamshalaId,
      checkin_date: { $gte: today }
    }).sort('checkin_date');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
};

exports.acceptBooking = async (req,res) => {
  try {
      const {bookingId} = req.params;
      const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          { status: 'confirmed' },
          { new: true }
      );
      if (!updatedBooking) {
          throw new Error('Booking not found');
      }
      sendBookingAcknowledgment(updatedBooking,'confirmed');
      res.json(updatedBooking);
  } catch (error) {
      throw new Error(`Failed to accept booking: ${error.message}`);
  }
};

exports.rejectBooking = async (req,res) => {
  try {
    const {bookingId} = req.params;
    // TODO add a reject reason for booking rejected by Daharmshaala Manager.
      const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          { status: 'cancelled' },
          { new: true }
      );
      if (!updatedBooking) {
          throw new Error('Booking not found');
      }
      sendBookingAcknowledgment(updatedBooking,'cancelled');
      return res.json(updatedBooking);
  } catch (error) {
      throw new Error(`Failed to reject booking: ${error.message}`);
  }
};
