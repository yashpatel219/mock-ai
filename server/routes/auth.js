const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User"); // import once at top

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.cookies["auth-token"];
  if (!token) {
    console.log("🔒 No token found in cookies");
    return res.status(401).json({ isAuthenticated: false, message: "No token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔒 Token verified, user:", decoded);
    req.user = decoded; // Attach decoded user to request
    next();
  } catch (err) {
    console.error("🔒 Token verification failed:", err.message);
    res.clearCookie("auth-token");
    return res.status(401).json({ isAuthenticated: false, message: "Invalid or expired token" });
  }
};

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
// @desc    Google auth callback
// @route   GET /api/auth/google/callback
// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
    session: false,
  }),
  async (req, res) => {
    try {
      const { token, user } = req.user;

      console.log("🔐 Google auth successful, user:", {
        id: user.id,
        name: user.name,
        email: user.email,
      });

      // Set token in cookie
      res.cookie("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 3600000, // 1 hour
        path: "/",
      });

      // Determine profile completeness
      const isProfileComplete =
        user.desiredPosition?.trim() !== "" &&
        user.experience > 0 &&
        user.department?.trim() !== "" &&
        user.industry?.trim() !== "" &&
        user.location?.trim() !== "" &&
        user.targetCompany?.trim() !== "";

      // Redirect based on profile completeness with fromAuth parameter
      const redirectTo = isProfileComplete ? "/categories" : "/profile-setup";
      res.redirect(`${process.env.CLIENT_URL}${redirectTo}?fromAuth=true`);
    } catch (err) {
      console.error("💥 Error in Google callback:", err.message);
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  }
);


// @desc    Get logged-in user
// @route   GET /api/auth/me
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email paid desiredPosition experience department industry location targetCompany"
    );

    if (!user) {
      console.warn("🚫 User not found for ID:", req.user.id);
      return res.status(404).json({ isAuthenticated: false, message: "User not found" });
    }

    // Check if user profile is complete
  const isProfileComplete =
  user.desiredPosition?.trim() !== "" &&
  user.experience > 0 &&
  user.department?.trim() !== "" &&
  user.industry?.trim() !== "" &&
  user.location?.trim() !== "" &&
  user.targetCompany?.trim() !== "";

res.json({
  isAuthenticated: true,
  isProfileComplete,
  user: {
    id: user._id,
    name: user.name || "User",
    email: user.email || "user@example.com",
    paid: user.paid || false,
    desiredPosition: user.desiredPosition || "",
    experience: user.experience || 0,
    department: user.department || "",
    industry: user.industry || "",
    location: user.location || "",
    targetCompany: user.targetCompany || "",
  },
});

  } catch (err) {
    console.error("💥 Error fetching user data:", err.message);
    res.status(500).json({ isAuthenticated: false, message: "Server error fetching user data" });
  }
});

// @desc    Update paid status of a user
// @route   PATCH /api/auth/paid
router.patch("/paid", authenticateToken, async (req, res) => {
  try {
    const { paid } = req.body; // expects { paid: true/false }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { paid },
      { new: true, select: "name email paid" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("💳 Updated paid status:", updatedUser);

    res.json({
      message: "Paid status updated",
      user: updatedUser,
    });
  } catch (err) {
    console.error("💥 Error updating paid status:", err.message);
    res.status(500).json({ message: "Server error updating paid status" });
  }
});

// @desc    Profile setup for new users
// @route   POST /api/auth/profile-setup
router.post("/profile-setup", authenticateToken, async (req, res) => {
  try {
    const { desiredPosition, experience, department, industry, location, targetCompany } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { desiredPosition, experience, department, industry, location, targetCompany },
      { new: true }
    );

    res.json({ message: "Profile saved", user: updatedUser });
  } catch (err) {
    console.error("💥 Error saving profile:", err.message);
    res.status(500).json({ message: "Server error saving profile" });
  }
});

// @desc    Logout user
// @route   GET /api/auth/logout
router.get("/logout", (req, res) => {
  console.log("🔓 Logging out user, clearing auth-token cookie");
  res.clearCookie("auth-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
    path: "/",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
