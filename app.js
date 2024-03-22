// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/googleAuthStrategy')
const MongoStore = require('connect-mongo');


// Import route files
const authRoutes = require('./routes/authRoutes');
const dharamshaalaRoutes = require('./routes/dharamshaalaRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize Express app
const app = express();

app.use(session({
  secret: 'aahi', // Change this to a random secret key
  resave: false,
  saveUninitialized: false,
  store : MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
}));


// Middleware
app.use(express.json());
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dharamshaalas', dharamshaalaRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
