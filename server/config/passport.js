const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/api/auth/google/callback", // adjust for prod
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find user in DB
        let user = await User.findOne({ googleId: profile.id });

        // If not, create new user
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails && profile.emails[0]?.value, // safe check
          });
        }

        // Generate JWT with DB user info
        const token = jwt.sign(
          { id: user._id, name: user.name, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        // Pass both user and token to callback
        done(null, { user, token });
      } catch (err) {
        done(err, null);
      }
    }
  )
);
