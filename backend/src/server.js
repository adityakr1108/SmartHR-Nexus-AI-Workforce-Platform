const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/database');
const redisClient = require('./config/redis');
const logger = require('./utils/logger');
const { initSocketHandlers } = require('./utils/socketHandler');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Route imports
const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const payrollRoutes = require('./routes/payroll.routes');
const performanceRoutes = require('./routes/performance.routes');
const recruitmentRoutes = require('./routes/recruitment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const aiRoutes = require('./routes/ai.routes');
const notificationRoutes = require('./routes/notification.routes');
const reportRoutes = require('./routes/report.routes');
const leaveRoutes = require('./routes/leave.routes');
const departmentRoutes = require('./routes/department.routes');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Connect to DB
connectDB();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());

// CORS
app.use(cors({
  origin: (origin, callback) => {
    const allowed = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    if (!origin || allowed.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// Attach io to req
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

// API Routes
const apiV1 = `/api/${process.env.API_VERSION || 'v1'}`;
app.use(`${apiV1}/auth`, authRoutes);
app.use(`${apiV1}/employees`, employeeRoutes);
app.use(`${apiV1}/attendance`, attendanceRoutes);
app.use(`${apiV1}/payroll`, payrollRoutes);
app.use(`${apiV1}/performance`, performanceRoutes);
app.use(`${apiV1}/recruitment`, recruitmentRoutes);
app.use(`${apiV1}/dashboard`, dashboardRoutes);
app.use(`${apiV1}/ai`, aiRoutes);
app.use(`${apiV1}/notifications`, notificationRoutes);
app.use(`${apiV1}/reports`, reportRoutes);
app.use(`${apiV1}/leaves`, leaveRoutes);
app.use(`${apiV1}/departments`, departmentRoutes);

// Socket handlers
initSocketHandlers(io);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 SmartHR Nexus server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    await mongoose.connection.close();
    await redisClient.disconnect();
    logger.info('Server closed.');
    process.exit(0);
  });
});

module.exports = { app, server, io };


