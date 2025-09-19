const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Determine callback URL based on environment
const CALLBACK_URL =
  process.env.NODE_ENV === "production"
    ? process.env.GOOGLE_CALLBACK_URL // e.g. "https://mock-ai-i1wu.onrender.com/api/auth/google/callback"
    : "http://localhost:4000/api/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        // Create new user if not found
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
          });
        }

        // Generate JWT
        const token = jwt.sign(
          { id: user._id, name: user.name, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        done(null, { user, token });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Optional: route handler to redirect to frontend after login
// Use this in your auth route after successful OAuth
passport.serializeUser((data, done) => {
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
  done(null, data);

  // This redirect should be done in your route, example:
  // res.redirect(`${frontendURL}/categories?success=true`);
});

module.exports = passport;
