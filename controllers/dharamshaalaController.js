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
const { validateDates } = require('../utils/datehelper');


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


exports.getBookingHistoryOfRoom = async (req,res) => {
  try {
      const {roomId} = req.params;
      const bookings = await Booking.find({ room_id: roomId }).populate('customer_id');
      return res.json(bookings);
  } catch (error) {
      throw new Error(`Failed to get booking history: ${error.message}`);
  }
};

exports.checkAvailability = async (dharamshaalaId, checkinDate, checkoutDate,needSegregatedRooms) => {
  try {
   

      // Inside checkAvailability function
      validateDates(checkinDate, checkoutDate);
    const bookings = await Booking.find({
        dharamshaala_id: dharamshaalaId,
        checkin_date: { $lte: checkoutDate },
        checkout_date: { $gte: checkinDate },
        status: { $in: ['confirmed', 'pending'] }
      });
      const availableRooms = await Room.find({
           dharamshaala_id : dharamshaalaId,
          _id: { $nin: bookings.map(booking => booking.room_id) }
      });
      if (needSegregatedRooms) {
        const segregatedRooms = {};
        for (const room of availableRooms) {
          const roomType = room.type;
          if (!segregatedRooms[roomType]) {
            segregatedRooms[roomType] = [];
          }
          segregatedRooms[roomType].push(room);
        }
        return segregatedRooms;
      } else {
        return availableRooms;
      }
  } catch (error) {
      throw new Error(`Failed to check availability: ${error.message}`);
  }
};

// Controller function to search Dharamshaalas by city and checkin/checkout dates

exports.searchDharamshaalas = async (req, res) => {
  try {
    // searchObject should be saved for future reference..
    const { city, checkinDate, checkoutDate } = req.query;
    // can add number of guest also in query params and filter accordingly.
    const dharamshaalas = await Dharamshaala.find({ city });
    const availableDharamshaalas = [];
    if (checkinDate && checkoutDate) {
      for (const dharamshaala of dharamshaalas) {
        const availableRooms = await this.checkAvailability(dharamshaala._id, checkinDate, checkoutDate,false);
        if (Object.keys(availableRooms).length > 0) {
          availableDharamshaalas.push({
            dharamshaala,
            availableRooms : availableRooms.length
          });
        }
      }
    } else {
      availableDharamshaalas = dharamshaalas;
    }
    res.json(availableDharamshaalas);
    // send address of dharamshaala also in response.
    // implement "best_image" field in dharamshaala schema and send that also in response.
    // cancellation policy can be added in response.
    // category_wise_media->  file can have fields :  category=Room,Entrance,WashRoom, extension=jpg,type=image etc 
    // lattitude & longitude.
    // map_link

    // Ratings model can be added to dharamshaala schema.
      // count, value, rating_level, rating_break_up_count,
    // restrictions can be added to dharamshaala schema.
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to get the current availability of rooms in a Dharamshaala for booking
exports.getDharamshaalaCurrentAvailabilityForBooking = async (req, res) => {
  try {
    const {dharamshaalaId} = req.params
    const { checkinDate, checkoutDate } = req.query;
    const dharamshaala = await Dharamshaala.findById(dharamshaalaId); 
    const availableRooms = await this.checkAvailability(dharamshaalaId, checkinDate, checkoutDate,true);
    res.json({dharamshaala,availableRooms});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
