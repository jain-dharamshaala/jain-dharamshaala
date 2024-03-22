const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../models/User')


passport.use(new GoogleStrategy({
    clientID: process.env.SIGN_WITH_GOOGLE,
    clientSecret: process.env.SIGN_WITH_GOOGLE_SECRET,
    callbackURL: 'http://localhost:9000/api/auth/google/callback',
    scope: ['profile','email']
  }, async (accessToken, refreshToken, profile, done) => {
    // Verification callback
    console.log('After sucessfull google login--');
    console.log(profile);
    try {
        // Find or create user based on Google profile
        let user = await User.findOne({ googleId: profile.id });
    
        if (!user) {
          // User not found, create a new user based on profile information
          console.log('Creating new user !!');
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value, // Assuming email is present in profile
            password: 'password'
          });
          // in this case we should send a mail asking user to set a password.
          await user.save();
        } else {
          console.log('User already exists !!');
        }
    
        return done(null, user); // Authentication succeeded
    
      } catch (error) {
        console.error('Error occurred:', error);
        return done(error); // Error occurred, authentication failed
      }
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id); // Serialize the user by storing its ID in the session
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user); // Deserialize the user by fetching it from the database using its ID
    } catch (error) {
      done(error); // Error occurred during deserialization
    }
  });

module.exports = passport;
