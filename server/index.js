const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const connectDB = require('./config/db');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Passport configuration
require('./config/passport');

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173",          // Vite dev server
      process.env.CLIENT_URL,           // Deployed frontend
    ],
    credentials: true,
  })
);

app.use(passport.initialize());

// ----- Routes -----
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const responseRoutes = require('./routes/responses');
const sessionRoutes = require('./routes/sessions');
const reviewRoutes = require('./routes/review');

app.use('/api/review', reviewRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/sessions', sessionRoutes);

// Simple welcome route (API root)
app.get('/api', (req, res) => {
  res.send('AI Mock Interview API is running');
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, 'client', 'mock-ai', 'dist');
  app.use(express.static(frontendPath));

  // Catch-all for React Router routes (e.g. /categories, /profile-setup, etc.)
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
