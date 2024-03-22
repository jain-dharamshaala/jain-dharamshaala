// controllers/dharamshaalaController.js
const Dharamshaala = require('../models/Dharamshaala');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

const oAuth2Client = require('../config/oauth2Client')
const nodemailer = require('nodemailer');
const { now } = require('mongoose');
const logger = require('../config/logger')
const {sendBookingAcknowledgment} = require('../modules/email/emailSender')
const {sendOtpViaSns} = require('../controllers/otpController')


// Controller function to get all Dharamshaalas
exports.getAllDharamshaalas = async (req, res) => {
  try {
    logger.info('Info: Getting All DHaramshaala');
    logger.debug('Debug: Getting All DHaramshaala');
    const dharamshaalas = await Dharamshaala.find();
    res.json(dharamshaalas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to create a new Dharamshaala
exports.createDharamshaala = async (req, res) => {
  const options = { validateBeforeSave: false };
  const images = req.files.map(file => file.key);
  const dharamshaala = new Dharamshaala({
    name: req.body.name,
    description: req.body.description,
    amenities: req.body.amenities,
    images: images,
    rooms: req.body.rooms,
    city: req.body.city,
    address: req.body.address
  });

  try {
    const newDharamshaala = await dharamshaala.save(options);
    res.status(201).json(newDharamshaala);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller function to get a specific Dharamshaala by ID
exports.getDharamshaalaById = async (req, res) => {
  try {
    const dharamshaala = await Dharamshaala.findById(req.params.id);
    if (!dharamshaala) {
      return res.status(404).json({ message: 'Dharamshaala not found' });
    }
    res.json(dharamshaala);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to update a Dharamshaala
exports.updateDharamshaala = async (req, res) => {
  try {
    const updatedDharamshaala = await Dharamshaala.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDharamshaala) {
      return res.status(404).json({ message: 'Dharamshaala not found' });
    }
    res.json(updatedDharamshaala);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller function to delete a Dharamshaala
exports.deleteDharamshaala = async (req, res) => {
  try {
    const deletedDharamshaala = await Dharamshaala.findByIdAndDelete(req.params.id);
    if (!deletedDharamshaala) {
      return res.status(404).json({ message: 'Dharamshaala not found' });
    }
    res.json({ message: 'Dharamshaala deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// dharamshaala features functions --
exports.getAllRoomsOfDharamshaala = async (req,res) => {
  try {
      let { dharamshaalaId} = req.params;
      const dharamshaala = await Dharamshaala.findById(dharamshaalaId).populate('rooms');
      await sendOtpViaSns('+917892016435', '143');
      console.log('SMS has been send sucessfully')
      if (!dharamshaala) {
          throw new Error('Dharamshaala not found');
      }
      res.json(dharamshaala.rooms);
  } catch (error) {
      throw new Error(`Failed to get rooms of Dharamshaala: ${error.message}`);
  }
};

exports.addRoomToDharamshaala = async (req,res) => {
  try {
      const {dharamshaalaId} = req.params; 
      const roomData = req.body;
      const room = new Room({ ...roomData, dharamshaala_id: dharamshaalaId });
      const savedRoom = await room.save();
      const dharamshaala = await Dharamshaala.findByIdAndUpdate(
          dharamshaalaId,
          { $push: { rooms: savedRoom._id } },
          { new: true }
      );
      if (!dharamshaala) {
          throw new Error('Dharamshaala not found');
      }
      return res.json(savedRoom);
  } catch (error) {
      throw new Error(`Failed to add room to Dharamshaala: ${error.message}`);
  }
};

exports.removeRoomFromDharamshaala = async (req,res) => {

  try {
      const {dharamshaalaId, roomId} = req.params;
      const dharamshaala = await Dharamshaala.findByIdAndUpdate(
          dharamshaalaId,
          { $pull: { rooms: roomId } },
          { new: true }
      );
      if (!dharamshaala) {
          throw new Error('Dharamshaala not found');
      }
      await Room.findByIdAndDelete(roomId);
      res.json({message : 'Room removed successfully'})
  } catch (error) {
      throw new Error(`Failed to remove room from Dharamshaala: ${error.message}`);
  }
};

const numberOfNights = (checkinDate, checkoutDate) => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = new Date(checkinDate);
  const secondDate = new Date(checkoutDate);
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
};

exports.reserveRoom = async (req,res) => {
  try {
      const {checkinDate, checkoutDate, customerId, perNightPrice,dharamshaala_id} = req.body;
      const {roomId} = req.params;
      const booking = new Booking({
          room_id: roomId,
          dharamshaala_id: dharamshaala_id,
          checkin_date: checkinDate,
          checkout_date: checkoutDate,
          customer_id: customerId,
          per_night_price: perNightPrice,
          total_price: perNightPrice * numberOfNights(checkinDate, checkoutDate),
          status: 'confirmed' // Assuming it's confirmed upon reservation
      });
      const savedBooking = await booking.save();
      // disable email for now.
      sendBookingAcknowledgment('aashaysinghai26@gmail.com')
      res.json(savedBooking);
  } catch (error) {
      throw new Error(`Failed to reserve room: ${error.message}`);
  }
};

exports.unreserveRoom = async (req,res) => {
  try {
      const {bookingId} = req.params;
      const booking = await Booking.findById(bookingId);
      if (!booking) {
          throw new Error('Booking not found');
      }
      await Booking.findByIdAndDelete(bookingId);
      res.json({message : 'Room unreserved Sucessfully.'});
  } catch (error) {
      throw new Error(`Failed to unreserve room: ${error.message}`);
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
      res.json(updatedBooking);
  } catch (error) {
      throw new Error(`Failed to accept booking: ${error.message}`);
  }
};

exports.rejectBooking = async (req,res) => {
  try {
    const {bookingId} = req.params;
      const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          { status: 'cancelled' },
          { new: true }
      );
      if (!updatedBooking) {
          throw new Error('Booking not found');
      }
      return res.json(updatedBooking);
  } catch (error) {
      throw new Error(`Failed to reject booking: ${error.message}`);
  }
};

exports.getBookingHistoryOfRoom = async (req,res) => {
  try {
      const {roomId} = req.params;
      const bookings = await Booking.find({ room_id: roomId }).populate('customer_id');
      return res.json(bookings);
  } catch (error) {
      throw new Error(`Failed to get booking history: ${error.message}`);
  }
};

exports.checkAvailability = async (dharamshaalaId, checkinDate, checkoutDate) => {
  try {
      const bookings = await Booking.find({
          dharamshaala_id: dharamshaalaId,
          checkin_date: { $lte: checkoutDate },
          checkout_date: { $gte: checkinDate }
      });
      const availableRooms = await Room.find({
          _id: { $nin: bookings.map(booking => booking.room_id) }
      });
      return availableRooms;
  } catch (error) {
      throw new Error(`Failed to check availability: ${error.message}`);
  }
};
