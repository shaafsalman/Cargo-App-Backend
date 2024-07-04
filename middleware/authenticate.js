// middleware/authenticate.js
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET_KEY || 'pavilion';

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Authorization token not provided' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authenticate;
