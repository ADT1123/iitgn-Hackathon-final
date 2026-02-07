// src/middleware/auth.js - Enhanced with optional auth
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Token is not valid'
            });
        }
    } catch (error) {
        next(error);
    }
};

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id).select('-password');
            } catch (err) {
                // Token invalid, but we continue without auth
                req.user = null;
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Role-based access control
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Rate limiting for specific routes
exports.apiLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();

    return (req, res, next) => {
        const key = req.ip;
        const now = Date.now();

        if (!requests.has(key)) {
            requests.set(key, { count: 1, startTime: now });
            return next();
        }

        const data = requests.get(key);

        if (now - data.startTime > windowMs) {
            requests.set(key, { count: 1, startTime: now });
            return next();
        }

        if (data.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests, please try again later'
            });
        }

        data.count++;
        next();
    };
};
