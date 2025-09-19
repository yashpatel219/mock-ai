const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const connectDB = require('./config/db');

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
      "http://localhost:5173",        // local frontend
      process.env.FRONTEND_URL,         // deployed frontend
    ],
    credentials: true,
  })
);

app.use(passport.initialize());

// ----- Routes -----
app.use('/api/review', require('./routes/review'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/responses', require('./routes/responses'));
app.use('/api/sessions', require('./routes/sessions'));

// Simple welcome route
app.get('/', (req, res) => {
  res.send('AI Mock Interview API is running');
});

// 🚫 removed frontend serving logic
// This way, ENOENT errors are gone

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
