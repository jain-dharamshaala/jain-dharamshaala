// controllers/roomController.js
const Room = require('../models/Room');

// Controller function to get all Rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to create a new Room
exports.createRoom = async (req, res) => {
  const room = new Room({
    room_number: req.body.room_number,
    dharamshaala_id: req.body.dharamshaala_id,
    type: req.body.type,
    amenities: req.body.amenities,
    images: req.body.images,
    checkin_time: req.body.checkin_time,
    checkout_time: req.body.checkout_time,
    status: req.body.status
  });

  try {
    const newRoom = await room.save();
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller function to get a specific Room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Controller function to create or update a Room
// Controller function to create or update a Room
// exports.upsertRoom = async (req, res) => {
//   let existing = {};
//   if (req.params.id) {
//     existing = await Room.findById(req.params.id);
//   }

//   const roomData = {
//     room_number: req.body.room_number || existing.room_number,
//     dharamshaala_id: req.body.dharamshaala_id || existing.dharamshaala_id,
//     type: req.body.type || existing.type,
//     amenities: req.body.amenities || existing.amenities,
//     images: req.body.images || existing.images,
//     checkin_time: req.body.checkin_time || existing.checkin_time,
//     checkout_time: req.body.checkout_time || existing.checkout_time,
//     status: req.body.status || existing.status
//   };
//   if (!roomData.room_number || !roomData.dharamshaala_id) {
//     return res.status(400).json({ message: 'Room number and Dharamshaala ID are required' });
//   }
//   try {
//     let room;
//     if (req.params.id) {
//       room = await Room.findByIdAndUpdate(req.params.id, roomData, { new: true, upsert: true });
//     } else {
//       room = new Room(roomData);
//       await room.save();
//     }
//     res.status(200).json(room);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// Controller function to create or update a Room
exports.upsertRoom = async (req, res) => {
  const roomData = {
    type: req.body.type,
    amenities: req.body.amenities,
    images: req.body.images,
    checkin_time: req.body.checkin_time,
    checkout_time: req.body.checkout_time,
    status: req.body.status,
    price: req.body.price,
  };
  // TODO can add validation here for room number and dharamshaala id later.
  try {
    const room = await Room.findOneAndUpdate(
      { _id: req.params.id },
      roomData,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to update a Room
exports.updateRoom = async (req, res) => {
  try {
    
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(updatedRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller function to delete a Room
exports.deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
