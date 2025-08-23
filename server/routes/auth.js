const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get('/dashboard', (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Expect: Bearer <token>

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      message: "Welcome to the dashboard",
      user: decoded,  // contains id, name, email
    });
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
});

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login`, session: false }),
  (req, res) => {
    const payload = { user: { id: req.user.id } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) return res.status(500).json({ error: 'Token generation failed' });

      res.cookie('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
        maxAge: 3600000, // 1 hour
      });

      res.redirect(`http://localhost:5173/dashboard?token=${req.user.token}`);
    });
  }
);

// @desc    Check if user is authenticated
// @route   GET /api/auth/me
router.get('/me', (req, res) => {
  const token = req.cookies['auth-token'];
  if (!token) return res.status(401).json({ isAuthenticated: false, message: 'No token found' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ isAuthenticated: true, user: decoded.user });
  } catch (err) {
    res.status(401).json({ isAuthenticated: false, message: 'Invalid token' });
  }
});

// @desc    Logout user
// @route   GET /api/auth/logout
router.get('/logout', (req, res) => {
  res.clearCookie('auth-token');
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
