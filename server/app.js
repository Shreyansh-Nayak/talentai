const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(helmet());

app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    if (!origin) return callback(null, true);
    if (allowed.includes(origin)) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
}));

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl} — Origin: ${req.headers.origin}`);
  next();
});

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { message: 'Too many requests, please try again later.' },
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/jobs',         require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/ai',           require('./routes/aiRoutes'));
app.use('/api/agent',        require('./routes/agentRoutes'));
app.use('/api/users',        require('./routes/userRoutes'));
app.use('/api/resumes',      require('./routes/resumeRoutes')); 
// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status:  'OK',
    message: 'TalentAI API is running',
    env:     process.env.NODE_ENV,
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

module.exports = app;